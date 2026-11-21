export const profile = {
  name: 'Giri Kondisetty',
  first: 'Giri',
  last: 'Kondisetty',
  role: 'Security engineer · AI systems',
  summary:
    'At work I build an AI security assistant. In my own time I build tools that show the evidence behind their answers.',
  email: 'gkondisetty@gmail.com',
  github: 'https://github.com/giri-kondisetty',
  linkedin: 'https://www.linkedin.com/in/giri-kondisetty/',
  resume: null,
};

const CAREER_START = new Date(2019, 5, 1);
const yearsSince = (date) => Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 3600 * 1000));

export const about = {
  paragraphs: [
    'I am a security software engineer. I have built security products since 2019, from endpoint detection to cloud security and, now, AI assistants, and I hold an MS in Computer Science from Boston University.',
    'Outside work I build my own product, end to end: connectors to the platforms it queries, an AI agent that shows the evidence behind every answer, and a gateway that every model call goes through.',
    'I am originally from Andhra Pradesh, India. I like software that is simple to check and honest about what it could not see.',
  ],
  stats: [
    { value: yearsSince(CAREER_START), suffix: '+', label: 'Years building security software' },
    { text: 'MS', label: 'Computer Science, Boston University' },
    { text: 'Cloud', label: 'Certified on AWS, GCP and Azure' },
  ],
};

export const projects = [
  {
    id: 'connectors',
    title: 'MCP connectors',
    kind: 'It started here',
    icon: 'plug',
    text: 'A few connectors that let an AI agent query cloud, data, identity, security and business platforms the same way.',
  },
  {
    id: 'jarvis',
    title: 'Jarvis',
    kind: 'Then my own agent',
    icon: 'graph',
    text: 'Existing AI agents did not fit, so I built my own. It shows the evidence behind every claim.',
    site: 'https://giri-kondisetty.github.io/jarvis/',
  },
  {
    id: 'gateway',
    title: 'Gateway Inference',
    kind: 'Then the model layer',
    icon: 'route',
    text: 'One place every model call goes through, with API keys, limits and per-organisation usage and billing.',
    site: 'https://giri-kondisetty.github.io/gateway/',
  },
  {
    id: 'sandbox',
    title: 'Sandbox Runner',
    kind: 'And a place to verify',
    icon: 'shield',
    text: 'Reproduces a security finding in a throwaway container pinned to a commit, with no network and no credentials.',
  },
];

export const experience = [
  {
    company: 'Uptycs',
    role: 'Senior Software Engineer',
    period: 'Jan 2024 – Present',
    points: [
      'Build Go services for an AI security assistant: investigations, report generation and audit logging, across several LLM providers and customer-supplied models.',
      'Integrate security, cloud and data platforms through MCP connectors and a proxy layer, and expose the assistant to AI clients over MCP.',
      'Ship it for both cloud and self-hosted deployments, with single sign-on, role-based access control, hardened containers and release automation.',
      'Earlier in the role, built AWS, GCP, Azure and IBM Cloud security integrations as Terraform.',
    ],
  },
  {
    company: 'Boston University',
    role: 'Graduate research, MS Computer Science',
    period: 'Jan 2023 – Jan 2024',
    points: [
      'Completed an MS in Computer Science focused on cloud security and platform engineering.',
      'Built tooling for vulnerability detection across infrastructure as code, SBOMs and containers, and a GitHub analytics platform for contributor behaviour and code churn.',
    ],
  },
  {
    company: 'Uptycs',
    role: 'Software Engineer',
    period: 'Jan 2020 – Jan 2023',
    points: [
      'Built XDR platform features that combine endpoint telemetry with cloud context and attack paths.',
      'Wrote detection logic and findings pipelines for Linux, macOS and Windows on the osquery-based Uptycs Agent.',
    ],
  },
  {
    company: 'Uptycs',
    role: 'Software Intern',
    period: 'Jun 2019 – Jan 2020',
    points: [
      'Built data-ingestion pipelines and alert-validation tools for XDR detection-rule development.',
      'Wrote scripts and test automation to check detection quality across platforms.',
    ],
  },
];

export const education = [
  {
    school: 'Boston University',
    degree: 'MS, Computer Science',
    period: '2023 – 2024',
  },
  {
    school: 'RGM College of Engineering and Technology',
    degree: 'BE, Electronics and Communication',
    period: '2015 – 2019',
  },
];

export const certifications = [
  { title: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services' },
  { title: 'Google Cloud Digital Leader', issuer: 'Google Cloud' },
  { title: 'Azure Fundamentals (AZ‑900)', issuer: 'Microsoft' },
  { title: 'Foundations of Cybersecurity', issuer: 'Google' },
  { title: 'Network Security', issuer: 'Cisco' },
  { title: 'Linux Administration', issuer: 'Independent study' },
];

export const skills = [
  { group: 'Languages', items: ['Go', 'Python', 'JavaScript', 'SQL', 'Shell'] },
  { group: 'AI and agents', items: ['MCP', 'LLM APIs (Anthropic, OpenAI, Bedrock, Foundry)', 'Tool calling', 'Embeddings and pgvector', 'Langfuse'] },
  { group: 'Backend and data', items: ['FastAPI', 'Postgres', 'Redis', 'ClickHouse', 'DuckDB', 'SQLite', 'Presto'] },
  { group: 'Frontend', items: ['React', 'Vite', 'MUI', 'ECharts', 'Mermaid', 'Accessibility'] },
  { group: 'Cloud and delivery', items: ['AWS', 'GCP', 'Azure', 'Terraform', 'Ansible', 'Docker', 'Jenkins', 'GitHub Actions'] },
  { group: 'Security and identity', items: ['Keycloak (SSO)', 'Vault', 'Sandboxing', 'SSRF defence', 'MITRE ATT&CK', 'Detection engineering'] },
  { group: 'Platforms I integrate', items: ['Splunk', 'CrowdStrike', 'Databricks', 'Elasticsearch', 'Neo4j', 'MongoDB', 'ServiceNow'] },
];
export const chapters = [
  { id: 'intro', label: 'Intro' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'background', label: 'Background' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
];

export const screens = [
  { id: 'intro', group: 'intro', kind: 'hero', g: 0 },
  { id: 'about', group: 'about', kind: 'about', g: 1.3 },
  { id: 'experience', group: 'experience', kind: 'experience', g: 2.3 },
  { id: 'projects', group: 'projects', kind: 'projects', g: 3.3 },
  {
    id: 'connectors',
    group: 'projects',
    kind: 'screen',
    g: 4.3,
    title: 'MCP connectors.',
    text: 'The project started with a few connectors. They reach cloud, data, identity, security and business platforms, so an AI agent can query all of them in the same way.',
  },
  {
    id: 'jarvis',
    group: 'projects',
    kind: 'screen',
    g: 5.3,
    title: 'Jarvis.',
    text: 'Existing AI agents did not fit, so I built my own. It plans an investigation, queries the connected platforms, and stores every result so each claim in its report links back to the data behind it.',
  },
  {
    id: 'gateway',
    group: 'projects',
    kind: 'screen',
    g: 6.3,
    title: 'Gateway Inference.',
    text: 'A multi-tenant API gateway with OpenAI and Anthropic compatible endpoints, streaming and tool calling. Every model call goes through it, with API keys, limits and usage and billing per organisation.',
  },
  {
    id: 'sandbox',
    group: 'projects',
    kind: 'screen',
    g: 7.3,
    title: 'Sandbox Runner.',
    text: 'The last piece of the product reproduces a security finding in a throwaway container pinned to a specific commit. During the proof the container has no network and holds no credentials, and afterwards only approved hosts can be reached.',
  },
  { id: 'background', group: 'background', kind: 'background', g: 8.3 },
  { id: 'skills', group: 'skills', kind: 'skills', g: 8.3 },
  { id: 'contact', group: 'contact', kind: 'contact', g: 9.3 },
];
