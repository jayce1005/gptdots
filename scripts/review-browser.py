from pathlib import Path
from playwright.sync_api import sync_playwright
import json
import os
BASE_URL=os.environ.get("PREVIEW_BASE_URL","http://127.0.0.1:8080")

out = Path(__file__).resolve().parents[1] / 'review'
out.mkdir(exist_ok=True)
report = {'viewports': [], 'form': {}, 'errors': []}
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    for name, width, height in [('desktop',1440,1000),('mobile',390,844)]:
        page = browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1,has_touch=name=='mobile')
        page.on('pageerror',lambda e: report['errors'].append(str(e)))
        if name == 'mobile':
            page.goto(BASE_URL+'/')
            summary=page.locator('.mobile-menu summary')
            summary.focus()
            page.keyboard.press('Enter')
            assert page.locator('.mobile-menu').get_attribute('open') is not None
            page.locator('.mobile-nav').get_by_role('link',name='About Us',exact=True).click()
            page.wait_for_url('**/about/')
            summary=page.locator('.mobile-menu summary')
            summary.tap()
            page.locator('.mobile-nav').get_by_role('link',name='Contact',exact=True).tap()
            page.wait_for_url('**/contact/')
        for route, label in [('/','home'),('/products/','products'),('/products/s16/','detail'),('/services/','services'),('/about/','about'),('/contact/','contact'),('/products/type/portable-bluetooth/','portable'),('/products/type/rgb-lighting/','rgb'),('/products/type/retro-style/','retro'),('/services/wholesale/','wholesale'),('/services/oem-odm/','oem-odm'),('/inquiry/?product=s16&intent=oem-odm','inquiry')]:
            response = page.goto(BASE_URL+''+route)
            assert response.status == 200
            assert page.locator('h1').count() == 1
            assert page.title()
            assert page.locator('meta[name=description]').get_attribute('content')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), route+' overflows'
            page.screenshot(path=str(out / f'{name}-{label}.png'),full_page=True)
        assert page.locator('select[name=product]').input_value() == 's16'
        assert page.locator('select[name=intent]').input_value() == 'oem-odm'
        assert page.locator('input[name=productUrl]').input_value().endswith('/products/s16/')
        page.locator('[name=company]').fill('Preview test company')
        page.locator('[name=email]').fill('review@example.invalid')
        page.locator('[name=destination]').fill('Test market')
        page.locator('[name=requirements]').fill('Local verification only')
        requests=[]
        page.on('request',lambda r: requests.append(r.url))
        page.get_by_role('button',name='Generate my brief').click()
        assert page.locator('#brief-result').is_visible()
        assert 'not sent' in page.locator('#brief').input_value()
        assert 'OEM / ODM enquiry' in page.locator('#brief').input_value()
        assert '/products/s16/' in page.locator('#brief').input_value()
        assert requests == [],requests
        page.locator('select[name=product]').select_option('gb03')
        assert page.locator('input[name=productUrl]').input_value().endswith('/products/gb03/')
        page.get_by_role('button',name='Generate my brief').click()
        assert '/products/gb03/' in page.locator('#brief').input_value()
        report['viewports'].append({'name':name,'width':width,'pagesChecked':12,'horizontalOverflow':False,'mobileMenuKeyboardAndTouch':name=='mobile'})
        report['form'][name]={'prefill':True,'productUrlUpdates':True,'localBrief':True,'outboundRequestsOnGenerate':len(requests)}
        page.close()
    nojs=browser.new_page(java_script_enabled=False)
    nojs.goto(BASE_URL+'/inquiry/')
    assert nojs.get_by_role('button',name='Generate my brief').is_disabled()
    nojs.close()
    report['javascriptDisabledSafe']=True
    browser.close()
assert not report['errors'],report['errors']
(out/'browser-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
