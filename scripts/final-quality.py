from pathlib import Path
from playwright.sync_api import sync_playwright
from xml.etree import ElementTree as ET
import json
import os
BASE_URL=os.environ.get("PREVIEW_BASE_URL","http://127.0.0.1:8080")

root = Path(__file__).resolve().parents[1]
out = root / 'review'
out.mkdir(exist_ok=True)
routes = sorted('/'+str(f.relative_to(root/'dist')).replace('index.html','') for f in (root/'dist').rglob('*.html'))
ET.parse(root/'dist/sitemap.xml')
report={'routes':len(routes),'responsive':[],'consoleErrors':[],'contrastFailures':[]}
contrast_script = r'''() => {
  const rgba=s=>(s.match(/[\d.]+/g)||[]).map(Number);
  const lum=rgb=>rgb.slice(0,3).map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4).reduce((s,n,i)=>s+n*[.2126,.7152,.0722][i],0);
  const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
  const bg=el=>{for(let n=el;n;n=n.parentElement){const c=rgba(getComputedStyle(n).backgroundColor);if(c.length===3||c[3]===1)return c}return [255,255,255]};
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),bad=[];
  while(walker.nextNode()) {const n=walker.currentNode,el=n.parentElement;if(!n.textContent.trim()||!el.checkVisibility({checkVisibilityCSS:true})||el.closest('script,style,[aria-hidden=true]'))continue;const s=getComputedStyle(el),font=parseFloat(s.fontSize),weight=parseInt(s.fontWeight)||400;const r=ratio(rgba(s.color),bg(el));if(!Number.isFinite(r))throw new Error('Invalid contrast calculation');const required=font>=24||(font>=18.66&&weight>=700)?3:4.5;if(r+.01<required)bad.push({text:n.textContent.trim().slice(0,60),ratio:+r.toFixed(2),required});}
  return bad;
}'''
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    for width in [320,768]:
        page=browser.new_page(viewport={'width':width,'height':900})
        page.on('pageerror',lambda e: report['consoleErrors'].append(str(e)))
        for route in routes:
            page.goto(BASE_URL+''+route)
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,route)
            assert page.locator('meta[name=robots]').get_attribute('content')=='noindex,nofollow'
            failures=page.evaluate(contrast_script)
            if failures:report['contrastFailures'].append({'width':width,'route':route,'failures':failures})
            # aria-current="page" must refer to the exact current document.
            for link in page.locator('header nav a[aria-current=page]').all():
                assert link.get_attribute('href')==route,(route,link.get_attribute('href'))
        page.goto(BASE_URL+'/')
        page.screenshot(path=str(out/f'qa-home-{width}.png'),full_page=True)
        report['responsive'].append({'width':width,'pagesChecked':len(routes),'horizontalOverflow':False})
        page.close()
    page=browser.new_page(viewport={'width':390,'height':844})
    network=[]
    page.goto(BASE_URL+'/inquiry/?product=%3Cimg%20src=x%20onerror=alert(1)%3E&intent=invalid')
    assert page.locator('[name=product]').input_value()==''
    assert page.locator('[name=intent]').input_value()=='general'
    assert page.locator('[name=productUrl]').input_value()==''
    assert page.locator('img').count()==0
    for field,value in [('company','   '),('email','review@example.invalid'),('destination','   '),('requirements','   ')]:
        page.locator('[name='+field+']').fill(value)
    page.on('request',lambda r: network.append(r.url))
    page.get_by_role('button',name='Generate my brief').click()
    assert not page.locator('#brief-result').is_visible()
    assert page.locator('[name=company]').evaluate('(el)=>!el.validity.valid')
    hostile='<img src=x onerror="window.injected=true"> & </textarea><script>window.injected=true</script>'
    for field,value in [('company',hostile),('destination','Test market'),('requirements',hostile+'\nSecond line')]:
        page.locator('[name='+field+']').fill(value)
    page.get_by_role('button',name='Generate my brief').click()
    assert page.locator('#brief-result').is_visible()
    assert hostile in page.locator('#brief').input_value()
    assert page.locator('#brief').input_value().count('\n')>=9
    assert page.evaluate('window.injected===undefined')
    assert page.locator('img').count()==0
    assert page.locator('#brief').evaluate('(el)=>document.activeElement===el')
    assert page.locator('#brief').evaluate('(el)=>getComputedStyle(el).outlineStyle')!='none'
    page.locator('[name=quantity]').fill('250')
    assert not page.locator('#brief-result').is_visible()
    assert page.locator('#brief').input_value()==''
    page.get_by_role('button',name='Generate my brief').click()
    assert '250' in page.locator('#brief').input_value()
    assert not network,network
    # Verify text export matches the current brief without a submission request.
    expected = page.locator('#brief').input_value()
    with page.expect_download() as download_info:
        page.get_by_role('button',name='Download .txt').click()
    download = download_info.value
    assert download.suggested_filename == 'speakerb2b-enquiry-brief.txt'
    assert Path(download.path()).read_text() == expected
    page.evaluate("Object.defineProperty(navigator, 'clipboard', {configurable:true,value:{writeText:async text=>{window.copiedBrief=text}}})")
    page.get_by_role('button',name='Copy brief',exact=True).click()
    page.wait_for_function("document.querySelector('#export-status').textContent.includes('Brief copied')")
    assert page.evaluate('window.copiedBrief') == expected
    page.evaluate("Object.defineProperty(navigator, 'clipboard', {configurable:true,value:{writeText:async()=>{throw new Error('denied')}}})")
    page.get_by_role('button',name='Copy brief',exact=True).click()
    page.wait_for_function("document.querySelector('#export-status').textContent.includes('Automatic copy is unavailable')")
    assert page.locator('#brief').evaluate('(el)=>el.selectionEnd-el.selectionStart') == len(expected)
    page.locator('[name=quantity]').fill('500')
    assert not page.locator('#brief-result').is_visible()
    assert page.locator('#export-status').inner_text() == ''
    assert not network,network
    report['briefExport']={'downloadMatchesBrief':True,'copySuccess':True,'copyDeniedFallback':True,'exportClearedOnEdit':True,'outboundRequests':0}
    report['inquiry']={'unknownQuerySafe':True,'whitespaceRejected':True,'markupRenderedAsText':True,'realLineBreaks':True,'staleBriefCleared':True,'resultFocused':True,'visibleKeyboardFocus':True,'outboundRequests':0}
    page.goto(BASE_URL+'/')
    page.keyboard.press('Tab')
    assert page.locator('.skip').evaluate('(el)=>document.activeElement===el')
    assert page.locator('.skip').bounding_box()['y']>=0
    page.keyboard.press('Enter')
    assert page.url.endswith('/#main')
    assert page.evaluate('document.activeElement.id')=='main'
    page.locator('.mobile-menu summary').focus()
    page.keyboard.press('Space')
    assert page.locator('.mobile-menu').get_attribute('open') is not None
    assert page.locator('.mobile-menu summary').evaluate('(el)=>getComputedStyle(el).outlineStyle')!='none'
    report['keyboard']={'skipLink':True,'menuSpaceKey':True,'menuFocusVisible':True}
    page.close()
    browser.close()
(out/'final-quality-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
assert not report['consoleErrors']
assert not report['contrastFailures']
