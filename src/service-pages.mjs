export const servicePages = [
  {
    path: 'wholesale', title: 'Wholesale & stock enquiries', eyebrow: 'WHOLESALE SOURCING',
    headline: 'Build your next speaker assortment.',
    intro: 'Prepare a wholesale brief for your shop, distribution business or business gifting project. Start with the models that fit your plans.',
    steps: [
      ['Shortlist your models', 'Choose one or more of the eight model candidates. Photos and technical specifications are still awaiting verification.'],
      ['Share your order context', 'Include quantities by model, destination market and your preferred arrival date. These are enquiry requirements, not confirmed order terms.'],
      ['Confirm the supply details', 'Current inventory, minimum quantities, pricing and shipping arrangements must be checked before any order can be agreed.']
    ],
    noteTitle: 'Stock needs a current check.',
    note: 'This catalog is not a live inventory feed. A listed model is not a promise of immediate availability. Ask for a current stock check and a reviewed quotation for your exact requirements.',
    intent: 'wholesale', action: 'Prepare a wholesale brief'
  },
  {
    path: 'oem-odm', title: 'OEM / ODM enquiries', eyebrow: 'BRANDING & DEVELOPMENT BRIEFS',
    headline: 'Start with your brand. Define the possibilities.',
    intro: 'Use an existing speaker model as the starting point for a branding enquiry, or describe a broader product development idea for feasibility review.',
    steps: [
      ['OEM / branding brief', 'Describe your logo placement, packaging and preferred finish. Available options, artwork requirements and minimum quantities are not yet confirmed.'],
      ['ODM / development brief', 'Explain the product changes or design goals you have in mind. Development capability, scope, tooling and costs require review; availability is not implied.'],
      ['Sample and approval requirements', 'Include any sample, artwork approval or documentation requirements. Sample terms, testing and timelines must be agreed before proceeding.']
    ],
    noteTitle: 'Every customization starts with verification.',
    note: 'No model is currently advertised with confirmed customization capability. Branding methods, materials, technical changes and certification requirements depend on the reviewed project scope.',
    intent: 'oem-odm', action: 'Prepare an OEM / ODM brief'
  }
];
