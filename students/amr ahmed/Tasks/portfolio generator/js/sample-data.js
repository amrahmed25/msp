/**
 * Fictional sample content used ONLY for template previews on the gallery page.
 * It is never written to the database.
 */
export const SAMPLE_DATA = {
  profile: { full_name: 'Alex Morgan', location: 'Cairo, Egypt', website: 'https://example.com', avatar_url: '' },
  portfolio: {
    slug: 'alex-morgan', headline: 'Product Designer and Developer', theme_color: '#2563EB', sections: {},
    contact_email: 'hello@example.com',
    about: 'I design and build clear, fast interfaces for web products.\n\nThis is sample content so you can see how the template lays out your own information.'
  },
  skills: [
    { name: 'HTML and CSS', category: 'Frontend' }, { name: 'JavaScript', category: 'Frontend' }, { name: 'Accessibility', category: 'Frontend' },
    { name: 'PostgreSQL', category: 'Backend' }, { name: 'REST APIs', category: 'Backend' }, { name: 'Figma', category: 'Design' }
  ],
  experience: [
    { job_title: 'Frontend Developer', company: 'Example Studio', start_date: '2024-02-01', is_current: true, description: 'Building design systems and customer-facing web apps.', order_index: 0 },
    { job_title: 'UI Designer', company: 'Sample Agency', start_date: '2022-01-01', end_date: '2024-01-01', description: 'Designed marketing sites and product flows.', order_index: 1 }
  ],
  projects: [
    { title: 'Weather Dashboard', description: 'A responsive dashboard with live forecasts and saved cities.', tech_tags: ['JavaScript', 'API'], github_url: 'https://github.com', demo_url: 'https://example.com', order_index: 0 },
    { title: 'Booking Platform', description: 'Reservation flow with availability calendar and email confirmations.', tech_tags: ['Supabase', 'CSS'], github_url: 'https://github.com', order_index: 1 },
    { title: 'Portfolio Kit', description: 'A small component library for personal sites.', tech_tags: ['HTML', 'CSS'], order_index: 2 }
  ],
  services: [
    { name: 'Website design and build', description: 'Landing pages and small business sites, delivered responsive.', price_label: 'From', price: 400, order_index: 0 },
    { name: 'UI audit', description: 'A written review of usability and accessibility with prioritised fixes.', price_label: 'From', price: 150, order_index: 1 }
  ],
  education: [{ degree: 'BSc', institution: 'Example University', field_of_study: 'Computer Science', start_year: 2018, end_year: 2022, order_index: 0 }],
  certifications: [{ name: 'Web Accessibility Fundamentals', issuer: 'Example Academy', issue_date: '2023-06-01', order_index: 0 }],
  links: [
    { platform: 'github', url: 'https://github.com', order_index: 0 },
    { platform: 'linkedin', url: 'https://linkedin.com', order_index: 1 }
  ]
};
