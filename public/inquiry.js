const form = document.querySelector('#inquiry-form');
const product = new URLSearchParams(location.search).get('product');
if (form) {
  form.querySelector('button[type=submit]').disabled = false;
  const select = form.elements.product;
  const brief = document.querySelector('#brief');
  const exportStatus = document.querySelector('#export-status');
  let revision = 0;
  document.querySelector('#copy-brief').addEventListener('click', async () => {
    if (!brief.value) return;
    const current = revision;
    const text = brief.value;
    try {
      await navigator.clipboard.writeText(text);
      if (current === revision) exportStatus.textContent = 'Brief copied. Nothing has been sent.';
    } catch {
      if (current !== revision) return;
      brief.focus();
      brief.select();
      exportStatus.textContent = 'Automatic copy is unavailable. Your brief is selected; use your device’s Copy command or download it.';
    }
  });
  document.querySelector('#download-brief').addEventListener('click', () => {
    if (!brief.value) return;
    const url = URL.createObjectURL(new Blob([brief.value], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'speakerb2b-enquiry-brief.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    exportStatus.textContent = 'Text download requested. Nothing has been sent.';
  });
  const intent = new URLSearchParams(location.search).get('intent');
  if ([...form.elements.intent.options].some(option => option.value === intent)) form.elements.intent.value = intent;
  if ([...select.options].some(option => option.value === product)) select.value = product;
  const productUrl = () => select.value ? new URL(`/products/${select.value}/`, location.origin).href : '';
  const sync = () => { form.elements.productUrl.value = productUrl(); };
  select.addEventListener('change', sync); sync();
  // A generated brief must never silently describe an earlier version of the form.
  const invalidateBrief = () => {
    revision++;
    exportStatus.textContent = '';
    document.querySelector('#brief-result').hidden = true;
    document.querySelector('#brief').value = '';
    document.querySelector('#form-status').textContent = '';
  };
  form.addEventListener('input', event => {
    if (event.target.id === 'brief') return;
    event.target.setCustomValidity?.('');
    invalidateBrief();
  });
  form.addEventListener('change', event => {
    if (event.target.id !== 'brief') invalidateBrief();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    for (const field of form.querySelectorAll('[required]')) {
      field.setCustomValidity(field.value.trim() ? '' : 'Please enter a value, not only spaces.');
    }
    if (!form.reportValidity()) return;
    revision++;
    exportStatus.textContent = '';
    sync();
    const values = new FormData(form);
    const text = ['SpeakerB2B enquiry', `Enquiry type: ${form.elements.intent.selectedOptions[0].text}`,  `Product: ${select.selectedOptions[0].text}`, `Product URL: ${values.get('productUrl') || 'General enquiry'}`, `Company: ${values.get('company')}`, `Email: ${values.get('email')}`, `Quantity: ${values.get('quantity') || 'To discuss'}`, `Destination: ${values.get('destination')}`, `Requirements: ${values.get('requirements')}`].join('\n');
    document.querySelector('#brief').value = text;
    const subject = `SpeakerB2B enquiry: ${select.selectedOptions[0].text}`;
    document.querySelector('#email-brief').href = `mailto:speakerb2b@outlook.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    document.querySelector('#brief-result').hidden = false;
    document.querySelector('#form-status').textContent = 'Your enquiry is ready below. Open your email app and press Send, or copy the brief.';
    document.querySelector('#brief').focus();
  });
}

const productSearch = document.querySelector('#product-search');
if (productSearch) {
  const grid = document.querySelector('.product-grid');
  const cards = [...grid.querySelectorAll('.product-card[data-product-name]')];
  const status = document.querySelector('#search-status');
  const sort = document.querySelector('#product-sort');
  const originalOrder = new Map(cards.map((card, index) => [card, index]));
  sort.disabled = false;
  const updateCatalog = () => {
    const query = productSearch.value.trim().toLowerCase();
    let count = 0;
    for (const card of cards) {
      card.hidden = !card.dataset.productName.includes(query);
      if (!card.hidden) count++;
    }
    const ordered = [...cards].sort((a, b) => {
      if (sort.value === 'name') return a.dataset.productName.localeCompare(b.dataset.productName, 'en', { numeric: true });
      if (sort.value.startsWith('price-')) {
        const aPrice = a.dataset.price === '' ? null : Number(a.dataset.price);
        const bPrice = b.dataset.price === '' ? null : Number(b.dataset.price);
        if (aPrice === null || bPrice === null) return aPrice === bPrice ? originalOrder.get(a) - originalOrder.get(b) : aPrice === null ? 1 : -1;
        return (aPrice - bPrice) * (sort.value === 'price-asc' ? 1 : -1) || originalOrder.get(a) - originalOrder.get(b);
      }
      return originalOrder.get(a) - originalOrder.get(b);
    });
    grid.append(...ordered);
    status.textContent = `${count} ${query ? 'matching ' : ''}model${count === 1 ? '' : 's'}`;
  };
  productSearch.addEventListener('input', updateCatalog);
  sort.addEventListener('change', updateCatalog);
}
