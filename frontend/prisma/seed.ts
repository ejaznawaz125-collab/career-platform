import {
  PrismaClient,
  UserRole,
  UserStatus,
  CompanySize,
  CompanyStatus,
  ExperienceLevel,
  JobType,
  WorkMode,
  JobStatus,
  ApplicationStatus,
  BlogStatus,
NotificationType,
NotificationStatus,
SubscriptionStatus,
PaymentStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "Admin@123";

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBoolean(percent = 50): boolean {
  return Math.random() * 100 < percent;
}

function randomDate(
  start: Date,
  end: Date
): Date {
  return new Date(
    start.getTime() +
      Math.random() *
        (end.getTime() - start.getTime())
  );
}

async function createCategory(
  name: string,
  description: string,
  icon: string
) {
  return prisma.category.upsert({
    where: {
      slug: slugify(name),
    },
    update: {},
    create: {
      name,
      slug: slugify(name),
      description,
      icon,
    },
  });
}
const categories = [
  {
    name: "Software Development",
    icon: "code",
    description:
      "Software engineering and application development jobs.",
  },
  {
    name: "Artificial Intelligence",
    icon: "brain",
    description:
      "Machine learning and AI opportunities.",
  },
  {
    name: "Data Science",
    icon: "database",
    description:
      "Data analysis and data engineering careers.",
  },
  {
    name: "Cyber Security",
    icon: "shield",
    description:
      "Information security and cyber defense jobs.",
  },
  {
    name: "Cloud Computing",
    icon: "cloud",
    description:
      "Cloud infrastructure and platform engineering.",
  },
  {
    name: "DevOps",
    icon: "server",
    description:
      "CI/CD, automation and infrastructure jobs.",
  },
  {
    name: "UI UX Design",
    icon: "palette",
    description:
      "User interface and user experience design.",
  },
  {
    name: "Digital Marketing",
    icon: "megaphone",
    description:
      "SEO, SEM and online marketing careers.",
  },
  {
    name: "Sales",
    icon: "briefcase",
    description:
      "Sales and business development positions.",
  },
  {
    name: "Human Resources",
    icon: "users",
    description:
      "Recruitment and HR management jobs.",
  },
  {
    name: "Finance",
    icon: "wallet",
    description:
      "Finance and investment careers.",
  },
  {
    name: "Accounting",
    icon: "calculator",
    description:
      "Accounting and bookkeeping positions.",
  },
  {
    name: "Healthcare",
    icon: "heart",
    description:
      "Medical and healthcare opportunities.",
  },
  {
    name: "Education",
    icon: "graduation-cap",
    description:
      "Teaching and education careers.",
  },
  {
    name: "Engineering",
    icon: "cpu",
    description:
      "Mechanical, civil and electrical engineering.",
  },
  {
    name: "Construction",
    icon: "building",
    description:
      "Construction and infrastructure jobs.",
  },
  {
    name: "Logistics",
    icon: "truck",
    description:
      "Warehouse, supply chain and logistics.",
  },
  {
    name: "Manufacturing",
    icon: "factory",
    description:
      "Manufacturing and production careers.",
  },
  {
    name: "Hospitality",
    icon: "hotel",
    description:
      "Hotels, restaurants and tourism jobs.",
  },
  {
    name: "Customer Support",
    icon: "headphones",
    description:
      "Customer service and support positions.",
  }
];
async function seedCategories() {
  console.log("Seeding Categories...");

  for (const category of categories) {
    await createCategory(
      category.name,
      category.description,
      category.icon
    );
  }

  console.log("Categories Completed");
}
const TOTAL_EMPLOYERS = 10;
const TOTAL_CANDIDATES = 50;
const TOTAL_COMPANIES = 20;
const TOTAL_JOBS = 200;

const COUNTRIES = [
  "Pakistan",
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Oman",
  "Bahrain",
  "Kuwait",
];

const CITIES = {
  Pakistan: [
    "Lahore",
    "Karachi",
    "Islamabad",
    "Rawalpindi",
    "Faisalabad",
    "Multan",
    "Bahawalpur",
    "Peshawar",
  ],

  "United Arab Emirates": [
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
  ],

  "Saudi Arabia": [
    "Riyadh",
    "Jeddah",
    "Dammam",
    "Makkah",
  ],

  Qatar: [
    "Doha",
  ],

  Oman: [
    "Muscat",
  ],

  Bahrain: [
    "Manama",
  ],

  Kuwait: [
    "Kuwait City",
  ],
};

const FIRST_NAMES = [
  "Ahmed",
  "Ali",
  "Hassan",
  "Usman",
  "Bilal",
  "Ahsan",
  "Hamza",
  "Zain",
  "Abdullah",
  "Saad",
  "Fatima",
  "Ayesha",
  "Zainab",
  "Maryam",
  "Noor",
  "Iqra",
  "Hira",
  "Sara",
  "Amna",
  "Khadija",
];

const LAST_NAMES = [
  "Khan",
  "Ahmed",
  "Malik",
  "Butt",
  "Raza",
  "Nawaz",
  "Qureshi",
  "Sheikh",
  "Ansari",
  "Chaudhry",
];
function fullName() {
  return {
    firstName: randomItem(FIRST_NAMES),
    lastName: randomItem(LAST_NAMES),
  };
}

function uniqueEmail(
  first: string,
  last: string,
  number: number
) {
  return `${first.toLowerCase()}.${last.toLowerCase()}${number}@careerplatform.dev`;
}

function randomLocation() {
  const country = randomItem(COUNTRIES);

  const city =
    randomItem(
      CITIES[country as keyof typeof CITIES]
    );

  return {
    country,
    city,
  };
}

function companySlug(name: string) {
  return slugify(name);
}
const COMPANY_NAMES = [
  "TechNova Solutions",
  "FutureSoft",
  "SkyNet Technologies",
  "Prime Logistics",
  "Global Warehouse",
  "Digital Horizon",
  "Cloud Matrix",
  "NextGen Systems",
  "Bright Future Group",
  "Vision Labs",
  "Blue Ocean Shipping",
  "Rapid Delivery",
  "Alpha Manufacturing",
  "Nexus Healthcare",
  "Smart Retail",
  "United Foods",
  "BuildPro Engineering",
  "Infinity Telecom",
  "SecureTech",
  "Vertex Consulting",
];


async function seedSuperAdmin() {
  console.log("Creating Super Admin...");

  const password = await hashPassword(DEFAULT_PASSWORD);

  return prisma.user.upsert({
    where: {
      email: "superadmin@careerplatform.dev",
    },

    update: {},

    create: {
      firstName: "Super",
      lastName: "Admin",

      username: "superadmin",

      email: "superadmin@careerplatform.dev",

      password,

      role: UserRole.SUPER_ADMIN,

      status: UserStatus.ACTIVE,

      emailVerified: new Date(),

      isProfileComplete: true,

      country: "Pakistan",

      city: "Lahore",

      address: "Head Office",
    },
  });
}

async function seedAdmins() {
  console.log("Creating Admin Users...");

  const password = await hashPassword(DEFAULT_PASSWORD);

  for (let i = 1; i <= 2; i++) {
    await prisma.user.upsert({
      where: {
        email: `admin${i}@careerplatform.dev`,
      },

      update: {},

      create: {
        firstName: "Admin",

        lastName: `${i}`,

        username: `admin${i}`,

        email: `admin${i}@careerplatform.dev`,

        password,

        role: UserRole.ADMIN,

        status: UserStatus.ACTIVE,

        emailVerified: new Date(),

        isProfileComplete: true,

        country: "Pakistan",

        city: "Islamabad",

        address: "Admin Office",
      },
    });
  }

  console.log("Admins Created");
}
async function seedEmployers() {
  console.log("Creating Employers...");

  const password = await hashPassword(DEFAULT_PASSWORD);

  const employers = [];

  for (let i = 1; i <= TOTAL_EMPLOYERS; i++) {
    const person = fullName();
    const location = randomLocation();

    const employer = await prisma.user.upsert({
      where: {
        email: uniqueEmail(
          person.firstName,
          person.lastName,
          i
        ),
      },

      update: {},

      create: {
        firstName: person.firstName,

        lastName: person.lastName,

        username: `employer-${Date.now()}-${i}`,

        email: uniqueEmail(
          person.firstName,
          person.lastName,
          i
        ),

        password,

        role: UserRole.EMPLOYER,

        status: UserStatus.ACTIVE,

        emailVerified: new Date(),

        isProfileComplete: true,

        phone: `03${randomNumber(
          0,
          49
        )
          .toString()
          .padStart(2, "0")}${randomNumber(
          1000000,
          9999999
        )}`,

        country: location.country,

        city: location.city,

        address: "Demo Office Address",

        linkedinUrl:
          "https://linkedin.com/company/demo-company",
      },
    });

    employers.push(employer);
  }

  console.log(`${employers.length} Employers Created`);

  return employers;
}
async function seedCandidates() {
  console.log("Creating Candidates...");

  const password = await hashPassword(DEFAULT_PASSWORD);

  const candidates = [];

  for (let i = 1; i <= TOTAL_CANDIDATES; i++) {
    const person = fullName();
    const location = randomLocation();

    const candidate = await prisma.user.upsert({
      where: {
        email: uniqueEmail(
          person.firstName,
          person.lastName,
          i + 100
        ),
      },

      update: {},

      create: {
        firstName: person.firstName,

        lastName: person.lastName,

       username: `candidate-${Date.now()}-${i}`,
        email: uniqueEmail(
          person.firstName,
          person.lastName,
          i + 100
        ),

        password,

        role: UserRole.USER,

        status: UserStatus.ACTIVE,

        emailVerified: new Date(),

        isProfileComplete: true,

        phone: `03${randomNumber(0, 49)
          .toString()
          .padStart(2, "0")}${randomNumber(
          1000000,
          9999999
        )}`,

        country: location.country,

        city: location.city,

        address: "Demo Address",

        linkedinUrl: "https://linkedin.com/in/demo",

        githubUrl: "https://github.com/demo",

        portfolioUrl: "https://portfolio.demo",
      },
    });

    candidates.push(candidate);
  }

  console.log(`${candidates.length} Candidates Created`);

  return candidates;
}
async function seedCompanies() {
  console.log("Creating Companies...");

  const employers = await prisma.user.findMany({
    where: {
      role: UserRole.EMPLOYER,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const companies = [];

  for (
    let i = 0;
    i < Math.min(TOTAL_COMPANIES, COMPANY_NAMES.length);
    i++
  ) {
    const owner = employers[i % employers.length];

    const location = randomLocation();

    const company = await prisma.company.upsert({
      where: {
        slug: companySlug(COMPANY_NAMES[i]),
      },

      update: {},

      create: {
        ownerId: owner.id,

        name: COMPANY_NAMES[i],

        slug: companySlug(COMPANY_NAMES[i]),

        description:
          `${COMPANY_NAMES[i]} is a demo company created for Career Platform development and testing.`,

        website:
          `https://${companySlug(
            COMPANY_NAMES[i]
          )}.com`,

        email:
          `info@${companySlug(
            COMPANY_NAMES[i]
          )}.com`,

        phone: `03${randomNumber(0, 49)
          .toString()
          .padStart(2, "0")}${randomNumber(
          1000000,
          9999999
        )}`,

        industry: randomItem([
          "Information Technology",
          "Logistics",
          "Healthcare",
          "Manufacturing",
          "Education",
          "Retail",
          "Finance",
          "Telecommunication",
        ]),

        companySize: randomItem([
          CompanySize.SMALL,
          CompanySize.MEDIUM,
          CompanySize.LARGE,
        ]),

        foundedYear: randomNumber(1995, 2023),

        employeeCount: randomNumber(20, 5000),

        country: location.country,

        city: location.city,

        address: "Demo Company Address",

        verified: true,

        status: CompanyStatus.ACTIVE,
      },
    });

    companies.push(company);
  }

  console.log(`${companies.length} Companies Created`);

  return companies;
}
async function seedJobs() {
  console.log("Creating Jobs...");

  const companies = await prisma.company.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  if (!companies.length) {
    throw new Error("Companies not found.");
  }

  if (!categories.length) {
    throw new Error("Categories not found.");
  }

  const jobTitles = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "UI UX Designer",
    "DevOps Engineer",
    "Data Analyst",
    "Data Scientist",
    "AI Engineer",
    "Cyber Security Engineer",
    "Warehouse Supervisor",
    "Store Keeper",
    "Logistics Coordinator",
    "Sales Executive",
    "HR Officer",
    "Accountant",
    "Marketing Executive",
    "Customer Support Officer",
    "Project Manager",
    "Business Analyst",
  ];

  const jobs = [];

  for (let i = 1; i <= TOTAL_JOBS; i++) {
    const company = randomItem(companies);

    const category = randomItem(categories);

    const title = randomItem(jobTitles);

    const location = randomLocation();

    const job = await prisma.job.upsert({
      where: {
        slug: `${slugify(title)}-${i}`,
      },

      update: {},

      create: {
        companyId: company.id,

        categoryId: category.id,

        title,

        slug: `${slugify(title)}-${i}`,

        description:
          "This is a demo job generated for development and testing purposes.",

        requirements:
          "Relevant experience, communication skills and willingness to learn.",

        responsibilities:
          "Perform assigned duties, collaborate with the team and achieve project goals.",

        benefits:
          "Medical insurance, annual leave and performance bonus.",

        education: "Bachelor Degree",

experienceLevel: randomItem([
  ExperienceLevel.ENTRY,
  ExperienceLevel.JUNIOR,
  ExperienceLevel.MID,
  ExperienceLevel.SENIOR,
]),

jobType: randomItem([
  JobType.FULL_TIME,
  JobType.PART_TIME,
  JobType.CONTRACT,
]),

workMode: randomItem([
  WorkMode.ONSITE,
  WorkMode.REMOTE,
  WorkMode.HYBRID,
]),

status: JobStatus.PUBLISHED,
salaryMin: randomNumber(500, 3000),

salaryMax: randomNumber(3500, 8000),

salaryCurrency: "USD",

country: location.country,

city: location.city,

vacancies: randomNumber(1, 10),

featured: randomBoolean(15),

urgent: randomBoolean(10),

        publishedAt: new Date(),

        expiresAt: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ),
      },
    });

    jobs.push(job);
  }

  console.log(`${jobs.length} Jobs Created`);

  return jobs;
}
async function seedCandidateProfiles() {
  console.log("Creating Candidate Profiles...");

  const candidates = await prisma.user.findMany({
    where: {
      role: UserRole.USER,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const profiles = [];

  for (const candidate of candidates) {
    const profile = await prisma.candidateProfile.upsert({
      where: {
        userId: candidate.id,
      },

      update: {},

      create: {
        userId: candidate.id,

        headline: randomItem([
          "Software Engineer",
          "Warehouse Supervisor",
          "Data Analyst",
          "Digital Marketing Specialist",
          "Frontend Developer",
          "Supply Chain Professional",
        ]),

        summary:
          "Experienced professional looking for new career opportunities.",

        currentJobTitle:
          randomItem([
            "Developer",
            "Supervisor",
            "Analyst",
            "Coordinator",
          ]),

        expectedSalary: randomNumber(
          800,
          5000
        ),

        salaryCurrency: "USD",

        totalExperience:
          randomNumber(1, 10),

        profileViews: randomNumber(
          10,
          500
        ),

        resumeScore: randomNumber(
          60,
          95
        ),

        availableForWork: true,

        openToRemote: randomBoolean(70),
      },
    });

    profiles.push(profile);

    await prisma.resume.create({
      data: {
        profileId: profile.id,

        title: "Professional Resume",

        fileUrl:
          "/uploads/demo-resume.pdf",

        fileSize:
          randomNumber(
            100000,
            500000
          ),

        isDefault: true,

        atsScore:
          randomNumber(
            70,
            95
          ),
      },
    });

    await prisma.experience.create({
      data: {
        profileId: profile.id,

        company:
          randomItem(COMPANY_NAMES),

        position:
          profile.currentJobTitle ||
          "Professional",

        employmentType:
          "FULL_TIME",

        location:
          `${candidate.city}, ${candidate.country}`,

        startDate:
          randomDate(
            new Date("2018-01-01"),
            new Date("2023-01-01")
          ),

        currentlyWorking:
          true,

        description:
          "Responsible for daily operations, teamwork and achieving business goals.",
      },
    });

    await prisma.education.create({
      data: {
        profileId: profile.id,

        institute:
          randomItem([
            "University of Technology",
            "National University",
            "Business Institute",
          ]),

        degree:
          "Bachelor Degree",

        fieldOfStudy:
          randomItem([
            "Computer Science",
            "Business Administration",
            "Engineering",
          ]),

        educationLevel:
          "BACHELOR",

        startYear:
          2015,

        endYear:
          2019,

        grade:
          "A",
      },
    });

    const skills = [
      "Communication",
      "Leadership",
      "Microsoft Excel",
      "Problem Solving",
      "Team Management",
      "Technical Skills",
    ];

    for (const skill of skills) {
      await prisma.candidateSkill.create({
        data: {
          profileId: profile.id,

          name: skill,

          level: randomNumber(
            1,
            5
          ),

          years:
            randomNumber(
              1,
              8
            ),
        },
      });
    }
  }

  console.log(
    `${profiles.length} Candidate Profiles Created`
  );

  return profiles;
}
async function seedApplicationsAndSavedJobs() {
  console.log("Creating Applications and Saved Jobs...");

  const candidates = await prisma.user.findMany({
    where: {
      role: UserRole.USER,
    },
  });

  const jobs = await prisma.job.findMany({
    where: {
      status: JobStatus.PUBLISHED,
    },
  });

  if (!candidates.length || !jobs.length) {
    throw new Error(
      "Candidates or Jobs not found."
    );
  }

  let applicationCount = 0;
  let savedJobCount = 0;

  for (const candidate of candidates) {
    const selectedJobs = jobs
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);

    for (const job of selectedJobs) {
      const existingApplication =
        await prisma.application.findUnique({
          where: {
            userId_jobId: {
              userId: candidate.id,
              jobId: job.id,
            },
          },
        });

      if (!existingApplication) {
        await prisma.application.create({
          data: {
            userId: candidate.id,

            jobId: job.id,

            coverLetter:
              "I am interested in this position and believe my skills match your requirements.",

            status: randomItem([
              ApplicationStatus.APPLIED,
              ApplicationStatus.REVIEWING,
              ApplicationStatus.SHORTLISTED,
            ]),
          },
        });

        applicationCount++;
      }


      const existingSavedJob =
        await prisma.savedJob.findUnique({
          where: {
            userId_jobId: {
              userId: candidate.id,
              jobId: job.id,
            },
          },
        });


      if (
        !existingSavedJob &&
        randomBoolean(40)
      ) {
        await prisma.savedJob.create({
          data: {
            userId: candidate.id,

            jobId: job.id,
          },
        });

        savedJobCount++;
      }
    }
  }

  console.log(
    `${applicationCount} Applications Created`
  );

  console.log(
    `${savedJobCount} Saved Jobs Created`
  );
}
async function seedBlogsAndNotifications() {
  console.log("Creating Blogs and Notifications...");

  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: [
          UserRole.ADMIN,
          UserRole.SUPER_ADMIN,
        ],
      },
    },
  });

  const users = await prisma.user.findMany({
    where: {
      role: UserRole.USER,
    },
  });


  if (!admins.length) {
    throw new Error(
      "Admin users not found."
    );
  }


  const blogData = [
    {
      title:
        "How to Build a Successful Career Path",

      excerpt:
        "Important steps for professional growth.",

      content:
        "Career planning, skill development and continuous learning help professionals achieve their goals.",
    },

    {
      title:
        "Top Skills Employers Look For",

      excerpt:
        "Learn the most valuable skills in today's job market.",

      content:
        "Communication, technical knowledge and problem solving are among the most demanded skills.",
    },

    {
      title:
        "How AI Is Changing Recruitment",

      excerpt:
        "Artificial intelligence in modern hiring.",

      content:
        "AI tools are helping companies find better candidates and improve recruitment processes.",
    },
  ];


  for (const blog of blogData) {
    await prisma.blog.upsert({
      where: {
        slug: slugify(blog.title),
      },

      update: {},

      create: {
        authorId:
          admins[0].id,

        title:
          blog.title,

        slug:
          slugify(blog.title),

        excerpt:
          blog.excerpt,

        content:
          blog.content,

        featuredImage:
          "/images/blog-demo.jpg",

        status:
          BlogStatus.PUBLISHED,

        publishedAt:
          new Date(),
      },
    });
  }


  let notificationCount = 0;


  for (const user of users) {
    await prisma.notification.create({
      data: {
        userId:
          user.id,

        title:
          "Welcome to Career Platform",

        message:
          "Your account has been created successfully. Start exploring jobs today.",

        type:
          NotificationType.SYSTEM,

        status:
          NotificationStatus.UNREAD,
      },
    });


    notificationCount++;
  }


  console.log(
    `${blogData.length} Blogs Created`
  );


  console.log(
    `${notificationCount} Notifications Created`
  );
}
async function seedUserFeatures() {
  console.log("Creating User Features...");

  const users = await prisma.user.findMany({
    where: {
      role: UserRole.USER,
    },
  });

  const jobs = await prisma.job.findMany({
    where: {
      status: JobStatus.PUBLISHED,
    },
  });


  if (!users.length || !jobs.length) {
    throw new Error(
      "Users or Jobs not found."
    );
  }


  let subscriptionCount = 0;
  let alertCount = 0;
  let searchCount = 0;
  let matchCount = 0;


  for (const user of users.slice(0, 15)) {

    await prisma.subscription.create({
      data: {
        userId:
          user.id,

        plan:
          randomItem([
            "Basic",
            "Premium",
            "Professional",
          ]),

        amount:
          randomNumber(
            10,
            100
          ),

        currency:
          "USD",

        status:
          SubscriptionStatus.ACTIVE,

        paymentStatus:
          PaymentStatus.PAID,

        startsAt:
          new Date(),

        expiresAt:
          new Date(
            Date.now() +
            365 *
            24 *
            60 *
            60 *
            1000
          ),
      },
    });

    subscriptionCount++;
  }


  for (const user of users) {

    await prisma.jobAlert.create({
      data: {

        userId:
          user.id,

        keyword:
          randomItem([
            "Developer",
            "Manager",
            "Engineer",
            "Warehouse",
            "Marketing",
          ]),

        country:
          randomItem(COUNTRIES),

        city:
          randomItem([
            "Lahore",
            "Karachi",
            "Dubai",
            "Riyadh",
          ]),

        jobType:
          randomItem([
            JobType.FULL_TIME,
            JobType.CONTRACT,
            JobType.PART_TIME,
          ]),

        workMode:
          randomItem([
            WorkMode.ONSITE,
            WorkMode.REMOTE,
            WorkMode.HYBRID,
          ]),

        enabled:
          true,
      },
    });

    alertCount++;


    await prisma.searchHistory.create({
      data: {

        userId:
          user.id,

        keyword:
          randomItem([
            "Software Engineer",
            "Data Analyst",
            "Warehouse Supervisor",
            "Remote Jobs",
          ]),
      },
    });

    searchCount++;


    const matchedJobs =
      jobs
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);


    for (const job of matchedJobs) {

      await prisma.aiJobMatch.create({
        data: {

          userId:
            user.id,

          jobId:
            job.id,

          score:
            randomNumber(
              70,
              98
            ),

          reason:
            "Skills and experience match this job opportunity.",
        },
      });

      matchCount++;
    }
  }


  console.log(
    `${subscriptionCount} Subscriptions Created`
  );

  console.log(
    `${alertCount} Job Alerts Created`
  );

  console.log(
    `${searchCount} Search History Created`
  );

  console.log(
    `${matchCount} AI Matches Created`
  );
}
async function seedMessagesAndLogs() {
  console.log("Creating Messages and Admin Logs...");

  const users = await prisma.user.findMany({
    where: {
      role: UserRole.USER,
    },
    take: 5,
  });


  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: [
          UserRole.ADMIN,
          UserRole.SUPER_ADMIN,
        ],
      },
    },
  });


  if (!users.length || !admins.length) {
    throw new Error(
      "Users or Admins not found."
    );
  }


  const conversation =
    await prisma.conversation.create({
      data: {},
    });


  await prisma.message.create({
    data: {

      conversationId:
        conversation.id,

      senderId:
        users[0].id,

      content:
        "Hello, I am interested in this opportunity.",

      isRead:
        false,
    },
  });


  await prisma.message.create({
    data: {

      conversationId:
        conversation.id,

      senderId:
        admins[0].id,

      content:
        "Thank you for contacting us. We will review your request.",

      isRead:
        true,
    },
  });


  for (const admin of admins) {

    await prisma.adminLog.create({
      data: {

        adminId:
          admin.id,

        action:
          "SEED_DATA_CREATED",

        entity:
          "SYSTEM",

        entityId:
          null,
      },
    });
  }


  console.log(
    "Messages and Admin Logs Created"
  );
}



async function main() {

  console.log(
    "Career Platform Database Seeding Started..."
  );


  await seedCategories();

  await seedSuperAdmin();

  await seedAdmins();

  await seedEmployers();

  await seedCandidates();

  await seedCompanies();

  await seedCandidateProfiles();

  await seedJobs();

  await seedApplicationsAndSavedJobs();

  await seedBlogsAndNotifications();

  await seedUserFeatures();

  await seedMessagesAndLogs();


  console.log(
    "Career Platform Database Seeding Completed Successfully."
  );
}



main()
  .catch((error) => {

    console.error(error);

    process.exit(1);

  })
  .finally(async () => {

    await prisma.$disconnect();

  });