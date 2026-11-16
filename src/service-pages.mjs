export const servicePages = [
  {
    path: 'wholesale', title: 'Wholesale speaker sourcing', eyebrow: 'WHOLESALE SPEAKERS',
    headline: 'Build a speaker range for your market.',
    intro: 'Explore Bluetooth speakers for retail, distribution and business gifting. Compare models and prepare the details needed for a quotation.',
    steps: [
      ['Choose your models', 'Browse silicone, portable and computer speakers. Compare available images and specifications to find a fit for your customers.'],
      ['Tell us about your order', 'List your preferred models, estimated quantities, destination market and target delivery date.'],
      ['Confirm your quotation', 'Confirm pricing, availability and the applicable shipping terms for your order.']
    ],
    noteTitle: 'Plan with current information.',
    note: 'Catalog prices are for reference. Confirm current pricing, inventory and delivery arrangements for your selected models.',
    intent: 'wholesale', action: 'Prepare a wholesale brief'
  },
  {
    path: 'oem-odm', title: 'OEM / ODM speaker projects', eyebrow: 'CUSTOM SPEAKER PROJECTS',
    headline: 'Make your next speaker range your own.',
    intro: 'Start with an existing model or describe your product idea. Share your branding and development requirements for a project-specific feasibility review.',
    steps: [
      ['Branding and packaging', 'Tell us about your logo, packaging, colours and artwork requirements. Available options depend on the model and order quantity.'],
      ['Product development', 'Describe the features or design changes you need. Scope, tooling, cost and technical feasibility require review.'],
      ['Samples and approval', 'Outline sample, testing, compliance and timing requirements so the next steps can be discussed for your market.']
    ],
    noteTitle: 'A project built around your requirements.',
    note: 'Branding methods, minimum quantities, samples and development options are confirmed for each model and project.',
    intent: 'oem-odm', action: 'Prepare an OEM / ODM brief'
  }
];
