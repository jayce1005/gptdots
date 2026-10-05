export const site = { name: 'SpeakerB2B', intendedDomain: 'speakerb2b.com', inquiryEnabled: false };
// Candidate identities remain separate until the original supplier records are checked.
export const candidates = ['MG II','GB03','GB01','S12','S16','S20','X2PRO','S11'];
export const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
export const products = candidates.map(name => ({ id: slug(name), name, image: null, status: 'Details under review', description: name === 'Digital-display RGB' ? 'A digital-display RGB speaker candidate for your sourcing shortlist.' : `${name} speaker candidate for wholesale and branding enquiries.` }));
