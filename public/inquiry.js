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
    const text = ['SpeakerB2B enquiry brief — not sent', `Enquiry type: ${form.elements.intent.selectedOptions[0].text}`,  `Product: ${select.selectedOptions[0].text}`, `Product URL: ${values.get('productUrl') || 'General enquiry'}`, `Company: ${values.get('company')}`, `Email: ${values.get('email')}`, `Quantity: ${values.get('quantity') || 'To discuss'}`, `Destination: ${values.get('destination')}`, `Requirements: ${values.get('requirements')}`].join('\n');
    document.querySelector('#brief').value = text;
    document.querySelector('#brief-result').hidden = false;
    document.querySelector('#form-status').textContent = 'Your brief is ready below. Nothing has been sent. Copy it for your own records.';
    document.querySelector('#brief').focus();
  });
}
