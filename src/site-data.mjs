export const site = { name: 'SpeakerB2B', intendedDomain: 'speakerb2b.com', inquiryEnabled: false };
// Candidate identities remain separate until the original supplier records are checked.
export const candidates = ['MG II','GB03','GB01','S12','S16','S20','S19','S11'];
export const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
export const products = candidates.map(name => ({ id: slug(name), name, image: null, status: 'Details under review', description: name === 'Digital-display RGB' ? 'A digital-display RGB speaker candidate for your sourcing shortlist.' : `${name} speaker candidate for wholesale and branding enquiries.` }));

// Populate only after the supplied GB01 images have been visually reviewed.
const gb01 = products.find(product => product.id === "gb01");
gb01.image = {src:'/images/gb01/gb01-main.png', alt:'GB01 speaker in a courtyard, with supplied playback-time information', width:1254, height:1254};
gb01.gallery = [];

gb01.description = 'GB01 combines Bluetooth 6.0, a single 10W full-range driver, DSP and three lighting modes for your speaker sourcing brief.';
gb01.detailTitle = 'GB01 Bluetooth 6.0 Speaker';
gb01.wholesalePrice = 'USD 7.80 / unit';
gb01.specifications = [
  ['Bluetooth version', 'Bluetooth 6.0'],
  ['Audio', 'Single 10W full-range driver with DSP. DSP chip model is not specified.'],
  ['Water protection', 'IPX6 water-jet protection as stated in the supplied product materials. Not for immersion.'],
  ['Playback time', 'Up to 12 hours at 30% volume with lights off. Actual playback varies with volume, lighting, audio content and use.'],
  ['Stereo pairing', 'TWS stereo pairing with two compatible speakers.'],
  ['Lighting', 'Steady white light, warm breathing light and SOS flashing red light. Red light is a warning-light feature; it is not a professional rescue device.'],
  ['Audio inputs', '3.5mm AUX; TF card up to 32GB; USB storage up to 32GB. TF and USB storage require FAT32 and support MP3 only, not WAV or FLAC.'],
  ['Charging', 'Type-C charging: 5V 1A/2A. USB PD and data input are not confirmed.']
];
gb01.specificationNote = 'Bluetooth version and wholesale price were confirmed by the seller; other listed features come from the supplied product images. Dimensions, weight, battery capacity and charging time remain unconfirmed.';

// GB03 details supplied by the user and the parent image review; image bytes are not local.
const gb03 = products.find(product => product.id === 'gb03');
gb03.image = { src: '/images/gb03/gb03-main.png', alt: 'GB03 black speaker with carrying strap, shown against a white background', width: 1200, height: 1200 };
gb03.gallery = [];
gb03.detailTitle = 'GB03 Bluetooth 6.0 Speaker';
gb03.description = 'Explore the black GB03 Bluetooth 6.0 speaker with DSP, BASS+3.0, IPX7 protection and a carrying strap. Up to 24 hours at 30% volume; actual playback varies with use. Wholesale Price: USD 13.20 / unit.';
gb03.wholesalePrice = 'USD 13.20 / unit';
gb03.specifications = [
  ['Bluetooth version', 'Bluetooth 6.0'],
  ['Power', '30W as stated in the supplied product materials. RMS or peak rating is not specified.'],
  ['Audio processing', 'DSP and BASS+3.0.'],
  ['Water protection', 'IPX7 as stated in the supplied product materials.'],
  ['Stereo pairing', 'TWS stereo pairing with two compatible speakers.'],
  ['Playback time', 'Up to 24 hours at 30% volume. Actual playback varies with volume and use.'],
  ['Colour', 'Black.'],
  ['Carry option', 'Carrying strap.']
];
gb03.specificationNote = 'Wholesale price, Bluetooth version and playback test volume were confirmed by the seller; other listed features come from the supplied product images. Frequency response, dimensions, weight, battery capacity, charging details and interfaces remain unconfirmed.';

const mgii = products.find(product => product.id === 'mg-ii');
mgii.image = {src:'/images/mgii/mgii-black-brass-main.jpg', alt:'MG II Black & Brass speaker with carrying strap on a white background', width:1500, height:1500, caption:'Black & Brass', colour:'Black & Brass'};
mgii.gallery = [mgii.image, {src:'/images/mgii/mgii-cream-main.png', alt:'MG II Cream speaker shown in three-quarter view', width:1600, height:1600, caption:'Cream', colour:'Cream'}];
mgii.colours = ['Cream', 'Black & Brass'];
mgii.detailTitle = 'MG II Bluetooth 6.0 24W Speaker';
mgii.description = 'MG II combines Bluetooth 6.0, a Single Full-Range Driver, 24W rated output, DSP, three EQ modes and ambient lighting, available in Cream and Black & Brass with a carrying strap.';
mgii.wholesalePrice = 'USD 21.60 / unit';
mgii.specifications = [
  ['Bluetooth version', 'Bluetooth 6.0'],
  ['Audio', 'Single Full-Range Driver with 24W rated output and DSP sound processing.'],
  ['EQ modes', 'Movie, Music and Party.'],
  ['Playback time', 'Advertised 17+ hours on a single charge, tested at 30% volume with lights off. Actual battery life varies with volume, content and usage.'],
  ['Stereo pairing', 'Pair two MG II speakers for TWS stereo with left and right channels. The supplied Cream product image labels the two-speaker setup as 48W.'],
  ['Lighting', 'Warm Glow constant light, Breathing Light and Red Safety Flash (SOS flashing red light shown in the Cream images). The warning light is not a professional rescue device.'],
  ['Controls', 'Mode and EQ switches; previous/next track and volume; play/pause and answer/hang up; power on/off.'],
  ['Colours', 'Cream; Black & Brass.'],
  ['Carry option', 'Carrying strap.'],
  ['Water protection', 'IP67 as stated in the supplied product image. The accompanying usage instruction says not for immersion in water. Do not immerse.']
];
mgii.specificationNote = 'Wholesale price and the Single Full-Range Driver configuration for both colours were confirmed by the seller. Other features are transcribed from the supplied images. Dimensions, weight, battery capacity, charging details and interfaces remain unconfirmed.';

// Supplier feature images grouped by the pictured colour.
mgii.gallery.push(...[
  {
    "src": "/images/mgii/mgii-cream-tws.jpg",
    "alt": "MG II Cream — TWS stereo pairing",
    "width": 1254,
    "height": 1254,
    "caption": "TWS stereo pairing",
    "colour": "Cream"
  },
  {
    "src": "/images/mgii/mgii-cream-eq.jpg",
    "alt": "MG II Cream — Movie, Music and Party EQ",
    "width": 1500,
    "height": 1500,
    "caption": "Movie, Music and Party EQ",
    "colour": "Cream"
  },
  {
    "src": "/images/mgii/mgii-cream-bluetooth-6.jpg",
    "alt": "MG II Cream — Bluetooth 6.0",
    "width": 1500,
    "height": 1500,
    "caption": "Bluetooth 6.0",
    "colour": "Cream"
  },
  {
    "src": "/images/mgii/mgii-cream-24w.jpg",
    "alt": "MG II Cream — 24W, DSP and Single Full-Range Driver",
    "width": 1500,
    "height": 1500,
    "caption": "24W, DSP and Single Full-Range Driver",
    "colour": "Cream"
  },
  {
    "src": "/images/mgii/mgii-cream-17h-playtime.jpg",
    "alt": "MG II Cream — 17+ hours; tested at 30% volume with lights off",
    "width": 1500,
    "height": 1500,
    "caption": "17+ hours; tested at 30% volume with lights off",
    "colour": "Cream"
  },
  {
    "src": "/images/mgii/mgii-cream-warm-light.jpg",
    "alt": "MG II Cream — Warm ambient light",
    "width": 1500,
    "height": 1500,
    "caption": "Warm ambient light",
    "colour": "Cream"
  },
  {
    "src": "/images/mgii/mgii-cream-sos.jpg",
    "alt": "MG II Cream — Red warning light; not a professional rescue device",
    "width": 1500,
    "height": 1500,
    "caption": "Red warning light; not a professional rescue device",
    "colour": "Cream"
  },
  {
    "src": "/images/mgii/mgii-cream-ip67.jpg",
    "alt": "MG II Cream — IP67 product information; do not immerse",
    "width": 1254,
    "height": 1254,
    "caption": "IP67 product information; do not immerse",
    "colour": "Cream"
  },
  {
    "src": "/images/mgii/mgii-black-brass-controls.jpg",
    "alt": "MG II Black & Brass — Button controls",
    "width": 1500,
    "height": 1500,
    "caption": "Button controls",
    "colour": "Black & Brass"
  },
  {
    "src": "/images/mgii/mgii-black-brass-playtime.jpg",
    "alt": "MG II Black & Brass — 17+ hours; tested at 30% volume with lights off",
    "width": 1500,
    "height": 1500,
    "caption": "17+ hours; tested at 30% volume with lights off",
    "colour": "Black & Brass"
  },
  {
    "src": "/images/mgii/mgii-black-brass-ip67.jpg",
    "alt": "MG II Black & Brass — IP67 product information; do not immerse",
    "width": 1500,
    "height": 1500,
    "caption": "IP67 product information; do not immerse",
    "colour": "Black & Brass"
  },
  {
    "src": "/images/mgii/mgii-black-brass-lighting.jpg",
    "alt": "MG II Black & Brass — Three ambient light modes",
    "width": 1500,
    "height": 1500,
    "caption": "Three ambient light modes",
    "colour": "Black & Brass"
  },
  {
    "src": "/images/mgii/mgii-black-brass-eq.jpg",
    "alt": "MG II Black & Brass — Movie, Music and Party EQ",
    "width": 1500,
    "height": 1500,
    "caption": "Movie, Music and Party EQ",
    "colour": "Black & Brass"
  },
  {
    "src": "/images/mgii/mgii-black-brass-tws.jpg",
    "alt": "MG II Black & Brass — TWS left and right stereo channels",
    "width": 1254,
    "height": 1254,
    "caption": "TWS left and right stereo channels",
    "colour": "Black & Brass"
  }
]);

gb01.gallery = [gb01.image, ...[
  {
    "src": "/images/gb01/gb01-power.png",
    "alt": "GB01 \u2014 10W full-range driver",
    "caption": "10W full-range driver",
    "width": 1254,
    "height": 1254
  },
  {
    "src": "/images/gb01/gb01-dsp.png",
    "alt": "GB01 \u2014 DSP audio processing",
    "caption": "DSP audio processing",
    "width": 1254,
    "height": 1254
  },
  {
    "src": "/images/gb01/gb01-ipx6.png",
    "alt": "GB01 \u2014 IPX6 water-jet protection; not for immersion",
    "caption": "IPX6 water-jet protection; not for immersion",
    "width": 1254,
    "height": 1254
  },
  {
    "src": "/images/gb01/gb01-tws.png",
    "alt": "GB01 \u2014 TWS stereo pairing",
    "caption": "TWS stereo pairing",
    "width": 1254,
    "height": 1254
  },
  {
    "src": "/images/gb01/gb01-lighting-modes.png",
    "alt": "GB01 \u2014 Three lighting modes",
    "caption": "Three lighting modes",
    "width": 1254,
    "height": 1254
  },
  {
    "src": "/images/gb01/gb01-sos.png",
    "alt": "GB01 \u2014 Red warning light; not a professional rescue device",
    "caption": "Red warning light; not a professional rescue device",
    "width": 1254,
    "height": 1254
  },
  {
    "src": "/images/gb01/gb01-connections.png",
    "alt": "GB01 \u2014 Audio inputs and charging information",
    "caption": "Audio inputs and charging information",
    "width": 1254,
    "height": 1254
  }
]];

gb03.gallery = [gb03.image, ...[
  {
    "src": "/images/gb03/gb03-battery-life.png",
    "alt": "GB03 \u2014 Up to 24 hours at 30% volume; actual playback varies with use",
    "caption": "Up to 24 hours at 30% volume; actual playback varies with use",
    "width": 1254,
    "height": 1254
  },
  {
    "src": "/images/gb03/gb03-dsp-sound.png",
    "alt": "GB03 \u2014 DSP sound processing",
    "caption": "DSP sound processing",
    "width": 1254,
    "height": 1254
  },
  {
    "src": "/images/gb03/gb03-dsp-detail.png",
    "alt": "GB03 \u2014 DSP feature details",
    "caption": "DSP feature details",
    "width": 1254,
    "height": 1254
  },
  {
    "src": "/images/gb03/gb03-tws-pairing.png",
    "alt": "GB03 \u2014 TWS pairing with two compatible speakers",
    "caption": "TWS pairing with two compatible speakers",
    "width": 1254,
    "height": 1254
  },
  {
    "src": "/images/gb03/gb03-ipx7-waterproof.png",
    "alt": "GB03 \u2014 IPX7 product information",
    "caption": "IPX7 product information",
    "width": 1254,
    "height": 1254
  },
  {
    "src": "/images/gb03/gb03-30w-power.png",
    "alt": "GB03 \u2014 30W and BASS+3.0; RMS or peak rating unspecified",
    "caption": "30W and BASS+3.0; RMS or peak rating unspecified",
    "width": 1254,
    "height": 1254
  },
  {
    "src": "/images/gb03/gb03-portable-design.png",
    "alt": "GB03 \u2014 Portable design with carrying strap",
    "caption": "Portable design with carrying strap",
    "width": 1254,
    "height": 1254
  }
]];

// White-background primary image; retain the courtyard image in the gallery.
gb01.image = {src:"/images/gb01/gb01-white-main.jpg",alt:"GB01 black-and-gold speaker with carrying strap on a white background",width:1500,height:1500,caption:"GB01 — white-background product view"};
gb01.gallery.unshift(gb01.image);
