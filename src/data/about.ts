/** Content for `/about/`. Edit here; layout lives in `src/pages/about.astro`. */

export const aboutMeta = {
  title: 'About — Larbi Wiran',
  description:
    'Design journey from Micro Machines sketches to Webflow, client work, and Harvous. Freelance designer, Lead UI/UX at One Branding, Webflow Expert with Kem Design Co.',
  ogImage: '/assets/about/larbi-photo.jpeg',
};

export const aboutHero = {
  headline: 'I tell people I fix things for a living. That\'s not entirely wrong.',
  introParagraphs: [
    'People say I bring a strong sense of ownership to everything I work on, that I ask the right questions before touching a keyboard, and that I\'m the kind of engineer you can trust to see things through.',
    'At the end of the day, I care about work that actually helps people — and I happen to also be the person who fixes the network when it goes down.',
  ],
  designJourneyKicker: "Here's my journey so far…",
  photoSrc: '/assets/about/larbi-photo.jpeg',
  photoAlt: 'Wiran Larbi',
  avatarSrc: '/assets/about/larbi-avatar.jpeg',
  avatarAlt: 'Illustrated avatar of Larbi',
  /** Shown in a slide-up panel on hero hover / focus. */
  avatarCredit: {
    href: 'https://www.kamalasam.net/larbi',
    artist: 'Kamala Sam',
    line: 'Illustration by',
  },
};

export type AboutSection = {
  heading: string;
  paragraphs: string[];
  bulletsTitle?: string;
  bullets?: string[];
};
export const aboutSections: AboutSection[] = [
  {
    heading: 'How I got into engineering',
    paragraphs: [
      'It started with Turok in 2004. Not just playing it — obsessing over how it worked. From there it was fixing the home network when it went down, unlocking phones, debugging anything with a power button.',
      'Technology was never just a hobby, it was the thing I always gravitated toward. That curiosity eventually found its way into code, and it turned out that\'s exactly what software engineering rewards.',
    ],
  },
  {
    heading: 'The degree that set the foundation',
    paragraphs: [
      'I went on to earn a Master\'s-level Engineering Degree in Software Engineering at the National School of Applied Sciences Al Hoceima, covering everything from systems architecture and distributed systems to cybersecurity and project management.',
      'It gave me the fundamentals. What came after gave me the perspective.',
    ],
  },
  {
    heading: 'First serious engineering work',
    paragraphs: [
      'My first real taste of professional engineering was at CBI, contributing to the advancement of an Odoo module. It was a short engagement but a meaningful one — I took full ownership of the development cycle, identifying needed features and proposing solutions independently.',
      'That experience taught me early on what good ownership looks like, and I\'ve carried that mindset into every project since.',
    ],
  },
  {
    heading: 'Going deeper',
    paragraphs: [
      'From there came Omnishore, where I worked on an omnichannel project for a major banking facilitator. The challenge was real — complex workflows, high stakes, and a need for something built to last. We delivered an end-to-end solution that moved the entire operation from manual processes to fully automated workflows.',
      'Then came Premium Technology and Services, where I worked on integrating a tokenization product with Mastercard and Visa APIs within banking core systems. Payment workflows, cryptography services, cross-team stakeholder communication — the kind of project that sharpens you fast.',
    ],
  },
  {
    heading: 'The latest',
    paragraphs: [
      'As of early 2026 I\'ve gone independent, taking on freelance work as a Full-Stack Software Engineer. I work directly with clients and stakeholders to design, build, and deploy scalable systems — from the architecture decisions all the way to production.',
      'What I care about most is work that actually means something. Solutions that remove friction, automate what shouldn\'t be manual, and hold up long after the project wraps.',
    ],
  },
  {
    heading: 'In my free time',
    paragraphs: [
      'Away from the screen you\'ll find me on the tennis court, out on a morning jog, or in the kitchen working through a new recipe.',
      'Three very different things that somehow teach the same lesson — patience, consistency, and the quiet satisfaction of doing something well.',
    ],
  },
];

export type AboutExpLink = {
  label: string;
  href: string;
  icon: 'arrow' | 'newspaper';
};

export type AboutExpItem = {
  name: string;
  range: string;
  description: string;
  link?: AboutExpLink;
};

export type AboutExpGroup = {
  title: string;
  items: AboutExpItem[];
};

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  context: string;
};

export const testimonials: Testimonial[] = [
  {
    quote: "Working with them at CBI was a pleasure from start to finish. They brought a strong sense of ownership and autonomy to the project — independently identifying what was needed and proposing well-thought-out solutions without waiting to be told. Their technical knowledge runs deep, and what sets them apart is how they pair that with genuine empathy and a collaborative spirit. Super approachable, easy to work with, and someone you'd want on any team.",
    author: 'Senior Engineer',
    role: 'Senior Engineer at CBI',
    context: 'Worked together at CBI · Sep 2023',
  },
  {
    quote: "The work delivered on our omnichannel project for a major banking client was outstanding. They took what were entirely manual processes and transformed them into fully automated workflows — delivering a complete end-to-end solution that was not only high-performing but clean, well-documented, and built to be maintainable long-term. Beyond the technical excellence, they were a pleasure to work with — professional, communicative, and genuinely invested in delivering the best outcome. A real asset to the project.",
    author: 'Business Manager',
    role: 'Business Manager at Omnishore',
    context: 'Worked together on omnichannel banking project · Jul 2024',
  },
  {
    quote: "Working on our tokenization project together was a genuinely great experience. They grasped the complexity of our payment workflows quickly and hit the ground running — contributing meaningfully to our solutions without missing a beat. What also stood out was their ability to communicate effectively across all our different stakeholders, making collaboration seamless. Punctual, highly professional, and with an incredible eye for detail. An amazing time working together — the kind of person you hope to cross paths with again.",
    author: 'Manager',
    role: 'Manager at PTS',
    context: 'Collaborated on tokenization project · Dec 2025',
  },
];

export const aboutExperienceGroups: AboutExpGroup[] = [
  {
    title: 'Current',
    items: [
      {
        name: 'Freelance',
        range: 'Jan 2026 — Present',
        description:
          'Freelance Full-Stack Software Engineer delivering end-to-end solutions for diverse clients. Designed, developed, and deployed scalable web applications while advising on technical feasibility, architecture decisions, and technology selection. Collaborated directly with stakeholders to translate business requirements into robust, production-ready systems.',
      },
    ],
  },
  {
    title: 'Past experience',
    items: [
      {
        name: 'Premium Technology and Services',
        range: 'Oct 2024 — Dec 2025',
        description:
          'Worked on integrating a tokenization product with Mastercard and Visa APIs within banking core systems. Delivered cryptography services and frontend interfaces using Java, Spring Boot, Golang, and Vue.js.',
      },
      {
        name: 'Omnishore',
        range: 'Feb 2024 — Jul 2024',
        description:
          'Worked on an omnichannel project for a major banking facilitator, delivering an end-to-end solution that moved operations from manual processes to fully automated workflows. Built with Java, Apache FOP, Docker, GitLab CI, Angular, and HTML.',
      },
      {
        name: 'CBI',
        range: 'Jul 2023 — Sep 2023',
        description:
          'Contributed to the advancement of an Odoo module, taking full ownership of the development cycle — from identifying needed features to proposing and implementing solutions. Built with Python, PostgreSQL, JavaScript, HTML, and CSS.',
      },
    ],
  },
  {
    title: 'Education',
    items: [
      {
        name: 'National School of Applied Sciences Al Hoceima',
        range: 'Sep 2019 — Jun 2024',
        description:
          'Master\'s-level Engineering Degree in Software Engineering. Covered Software Engineering and Systems Architecture, Web and Mobile Application Development, Databases and Information Systems, Algorithms and Data Structures, Networks and Distributed Systems, IT Project Management (Agile, Scrum), and Cybersecurity and OWASP Standards.',
          link: {
          label: 'Major Subjects studied',
          href: 'https://ensah.ma/public/gi.php',
          icon: 'newspaper',
        },
      },
    ],
  },
];
