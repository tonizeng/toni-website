export type TimelineItem = {
  company: string;
  dates: string;
  role: string;
  blurb: string;
};

export type ProjectItem = {
  name: string;
  context?: string;
  description: string;
  link?: string;
};

export type QAEntry = {
  id: string;
  category: "projects" | "experience" | "about" | "future" | "inspiration";
  question: string;
  keywords: string[];
  answer: string;
  images?: { src: string; caption?: string }[];
  // 0-indexed paragraph (split on "\n\n") after which images render.
  // Defaults to the last paragraph (i.e. images appear at the very end).
  imageAfterParagraph?: number;
  timeline?: TimelineItem[];
  projects?: ProjectItem[];
};

const JOB_EXPERIENCE_SUMMARY =
  "I've done six internships across a variety of companies and industries, and I'm currently working as an Infrastructure Engineering Intern at Shopify.";

const JOB_EXPERIENCE_TIMELINE: TimelineItem[] = [
  {
    company: "Shopify",
    dates: "Jan 2026 – Aug 2026 (current)",
    role: "Infrastructure Engineering Intern · MySQL Infrastructure",
    blurb:
      "Working on database infrastructure and diving deep into ProxySQL and MySQL systems.",
  },
  {
    company: "Shopify",
    dates: "May 2025 – Aug 2025",
    role: "Software Engineering Intern · Database Services",
    blurb:
      "Worked on database services and developer tooling for schema migrations.",
  },
  {
    company: "Kinaxis",
    dates: "Sept 2024 – Dec 2024",
    role: "Software Developer Intern · Backend Apps & Tools",
    blurb: "Worked on internal services and dashboards.",
  },
  {
    company: "Royal Bank of Canada",
    dates: "Jan 2024 – Apr 2024",
    role: "Software Engineering Intern · Online Banking Pipelines",
    blurb: "Worked on online banking tooling and CI/CD pipelines for legacy systems.",
  },
  {
    company: "Metrolinx",
    dates: "May 2023 – Aug 2023",
    role: "Data Engineering Intern · Capital Project Groups Reporting",
    blurb: "Worked with data automation pipelines.",
  },
];

const PROJECT_SUMMARY =
  "Here are a few projects I've built outside of work and school.";

const PROJECT_TIMELINE: ProjectItem[] = [
  {
    name: "spotSpot",
    context: "CtrlHackDel 2024 @ York University (3rd place)",
    description: "An acne detection classifier that identifies your acne type with the click of a button, providing tailored treatment options and guidance — skipping long physician lines or referrals, especially amid the growing shortage of doctors.",
    link: "https://github.com/tonizeng/spotSpot",
  },
  {
    name: "AirCast",
    description: "A portable Arduino-based device that monitors outdoor air quality and temperature to help users avoid unsafe conditions. Sensor data can be viewed on the device or visualized in real time through a Python dashboard.",
    link: "https://github.com/tonizeng/AirCast",
  },
  {
    name: "MealPlanBuddy",
    description: "A meal-planning app that helps university students create personalized accounts, save weekly meal plans, and discover recipes through the Spoonacular API.",
    link: "https://github.com/tonizeng/MealPlanBuddy",
  },
];

export const qaData: QAEntry[] = [
  {
    id: "job-experience",
    category: "experience",
    question: "What work experience do you have?",
    keywords: [
      "job",
      "job experience",
      "work experience",
      "internship",
      "internships",
      "career",
      "co-op",
      "worked",
      "resume",
      "experience",
      "shopify",
      "kinaxis",
      "rbc",
      "royal bank",
      "metrolinx",
      "timeline",
    ],
    answer: JOB_EXPERIENCE_SUMMARY,
    timeline: JOB_EXPERIENCE_TIMELINE,
  },
  {
    id: "about-me",
    category: "about",
    question: "Tell me more about you",
    keywords: [
      "about",
      "about me",
      "who are you",
      "yourself",
      "introduce yourself",
      "bio",
      "tell me about you",
      "tell me more",
      "hobbies",
      "hobby",
      "interests",
      "free time",
      "fun",
      "outside of work",
      "do for fun",
      "enjoy doing",
      "favourites",
      "favorites",
      "favorite",
      "favourite",
      "personal favourites",
      "favourite things"
    ],
    answer:
      "I'm currently in my **fourth year** of **Mechatronics Engineering** at the **University of Waterloo**. Throughout my degree, I've had the chance to explore different areas of engineering, but I found myself especially drawn to software because of how much room there is to **create**, **experiment**, and **solve problems in different way**.\n\n" +
      "Outside of school and work, I enjoy travelling and staying active through various racket sports and pilates. In my downtime, I usually read, paint, or play games on my nintendo switch. My current read (inspired by the greek mythology course I'm currently taking) is The Song of Achilles.\n\n" +
      "I'm always looking for new ways to be **creative**, **learn**, and **challenge myself**, whether that means building something, picking up a new skill, or trying an unfamiliar activity. My latest goal is to learn how to knit.\n\n" +
      "Curious about more? Ask about my [plans after grad](ask:future-plans) or [why I chose software engineering](ask:why-software-engineering).",
    images: [
      { src: "/toni1.JPG", caption: "Point Reyes, California" },
      { src: "/toni2.jpg", caption: "Arashiyama, Kyoto" },
    ],
    imageAfterParagraph: 1,
  },
  {
    id: "project-experience",
    category: "projects",
    question: "What projects have you worked on?",
    keywords: [
      "project",
      "projects",
      "project experience",
      "built",
      "portfolio",
      "made",
      "side project",
      "spotspot",
      "aircast",
      "mealplanbuddy",
    ],
    answer: PROJECT_SUMMARY,
    projects: PROJECT_TIMELINE,
  },
  {
    id: "future-plans",
    category: "future",
    question: "What are your plans after graduation?",
    keywords: [
      "future",
      "plans",
      "future plans",
      "goals",
      "where do you see yourself",
      "next steps",
      "after graduation",
      "travel",
      "convocation",
      "new grad",
    ],
    answer:
      "Immediately after school ends, my plan is to travel to China with my family. I've only been back twice to visit my hometown, but I never really got the chance to embrace the tourism side of it. Flights are also usually cheaper within Asia, so I'm definitely taking the opportunity to meet up with friends and travel to other places (and making that 16-hour flight across the world worth it).\n\n" +
      "The goal is to make the most of my time off, check a few things off my bucket list, and get some much-needed downtime after five years of school.\n\n" +
      "By then, I hope to have found a new grad / full-time role that challenges my brain every day. I'm excited for wherever the opportunities take me.\n\n" +
      "Oh, and also maybe adopt a cat to keep me company while I code.\n\n",
    images: [{ src: "/cats.jpg", caption: "some cute cats I saw in chinatown" }],
  },
  {
    id: "why-software-engineering",
    category: "inspiration",
    question: "Why software engineering?",
    keywords: [
      "why software engineering",
      "why this career",
      "why this industry",
      "career path",
      "inspired",
      "what inspired you",
      "why engineering",
      "origin story",
    ],
    answer:
      "According to my daycare photos, I first wanted to be a police officer and a cat? [(yes, actually a cat)](/tinytoni.jpg)\n\n" +
      "In grade 6, I wanted to be an architect after visiting Chicago and getting inspired by the tall buildings, the moving bridges, and the bean.\n\n" +
      "In grade 9, I discovered what engineering was in my technology and design course. It quickly became my favourite class, since we got to do a lot of design work with SolidWorks, AutoCAD, and woodworking.\n\n"+ 
      "In grade 10 and 11, I took computer science, where I learned how to code and built video games in Java—including my own janky version of Cut the Rope and Fireboy and Watergirl.\n\n" +
      "During the pandemic, in the summer before Grade 12, I joined a program called STEMing UP. I worked with a team of girls my age to design and build a website for a small business. It was my first real experience with software development. With guidance from experienced software engineers, I learned how development teams collaborate and was introduced to concepts like sprints. \n\n" +
      "When it was time to apply to university, I was still unsure what I wanted to study. I only knew that I wanted to do something that involved building and designing. I ultimately chose Mechatronics Engineering at Waterloo because I wasn’t ready to narrow myself down to one field. The program gave me the flexibility to explore different areas of engineering, while its co-op program allowed me to experience them firsthand.\n\n" + 
      "After completing several software engineering internships, I realized that software was the path I enjoyed most. The possibilities felt endless, and there was always something new to build, solve, or learn.",
  },
];
