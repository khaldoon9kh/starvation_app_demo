export const libraryData = [
  {
    id: 'law-starvation',
    title: 'Law on Starvation',
    color: '#2196F3',
    expandable: true,
    items: [
      {
        title: 'ICL Framework',
        description: 'International Criminal Law framework for starvation crimes'
      },
      {
        title: 'IHL Framework', 
        description: 'International Humanitarian Law provisions'
      },
      {
        title: 'IHRL Framework',
        description: 'International Human Rights Law framework'
      },
      {
        title: 'IHRL at a Glance',
        description: 'Quick reference guide to human rights law'
      },
      {
        title: 'Human Rights Obligations',
        description: 'State obligations under international human rights law'
      },
      {
        title: 'Starvation and ESC Rights',
        description: 'Economic, Social and Cultural Rights in starvation contexts'
      },
      {
        title: 'Starvation and CP Rights',
        description: 'Civil and Political Rights considerations'
      }
    ]
  },
  {
    id: 'basic-investigation',
    title: 'Basic Investigation Standards',
    color: '#2196F3',
    expandable: false,
    description: 'Essential principles and techniques for starvation investigations'
  },
  {
    id: 'remedies',
    title: 'Remedies',
    color: '#2196F3',
    expandable: false,
    description: 'Guidance on bringing cases before courts and UN bodies'
  },
  {
    id: 'starvation-crimes',
    title: 'Starvation-Related Crimes',
    color: '#2196F3',
    expandable: false,
    description: 'Analysis of crimes including genocide, crimes against humanity'
  },
  {
    id: 'glossary',
    title: 'Glossary',
    color: '#4CAF50',
    expandable: false,
    description: 'Definitions of key terms and concepts'
  },
  {
    id: 'diagrams',
    title: 'Diagrams',
    color: '#4CAF50',
    expandable: false,
    description: 'Visual representations and flowcharts'
  }
];

export const templatesData = [
  {
    id: 1,
    title: 'Witness Risk Checklist',
    description: 'A list of questions guiding the identification and mitigation of risks on a witness prior to, during, and after an interview',
    category: 'Basic Interview',
    color: '#4CAF50'
  },
  {
    id: 2,
    title: 'Modes of Liability Checklist',
    description: 'A list of questions to guide an investigation into an incident involving multiple types of actors and various potential modes of liability.',
    category: 'Investigation Preparation',
    color: '#4CAF50'
  },
  {
    id: 3,
    title: 'Risk Assessment Tool',
    description: 'A quick guide for the identification, assessment, mitigation and management of risks in an investigation.',
    category: 'Investigation Preparation',
    color: '#4CAF50'
  },
  {
    id: 4,
    title: 'Trauma Victim Interview Guide',
    description: 'A list of bad and good practices based on a trauma-informed approach',
    category: 'Special Interview',
    color: '#4CAF50'
  },
  {
    id: 5,
    title: 'Evidence Collection Checklist',
    description: 'Comprehensive guide for collecting and preserving evidence',
    category: 'Evidence Collection',
    color: '#4CAF50'
  },
  {
    id: 6,
    title: 'Forum Shopping Guide',
    description: 'Guide for selecting appropriate legal forums',
    category: 'Forum Shopping',
    color: '#4CAF50'
  }
];

export const exportCategories = [
  {
    title: 'All Templates and Checklists',
    count: templatesData.length
  },
  {
    title: 'Basic Interview',
    count: templatesData.filter(t => t.category === 'Basic Interview').length
  },
  {
    title: 'Special Interview',
    count: templatesData.filter(t => t.category === 'Special Interview').length
  },
  {
    title: 'Evidence Collection',
    count: templatesData.filter(t => t.category === 'Evidence Collection').length
  },
  {
    title: 'Investigation Preparation',
    count: templatesData.filter(t => t.category === 'Investigation Preparation').length
  },
  {
    title: 'Forum Shopping',
    count: templatesData.filter(t => t.category === 'Forum Shopping').length
  }
];
