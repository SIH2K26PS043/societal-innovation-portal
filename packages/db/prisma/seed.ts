/**
 * Seed data — realistic Jharkhand content for the demo.
 * Idempotent: wipes existing rows first, so it's safe to re-run.
 *
 * Run:  pnpm db:seed
 * After seeding, M3 runs the AI backfill so vector columns + clusters + routing fill in:
 *   cd apps/ai && python -m app.scripts.backfill_embeddings
 *
 * Keep the 8 Ranchi water duplicates — they're the dedup showcase. The seeded
 * assignments / projects / outcomes make the government dashboards non-empty even
 * before M3 runs.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const hash = (pw: string) => bcrypt.hashSync(pw, 10);

async function wipe() {
  // FK-safe order
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.outcome.deleteMany();
  await prisma.partnership.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.problemMedia.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.cluster.deleteMany();
  await prisma.industryProfile.deleteMany();
  await prisma.facultyProfile.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
  await prisma.university.deleteMany();
}

async function main() {
  console.log("Wiping existing data…");
  await wipe();
  console.log("Seeding…");

  // ── Universities ──
  const bit = await prisma.university.create({ data: { name: "BIT Mesra", district: "Ranchi", type: "Deemed", website: "https://www.bitmesra.ac.in", latitude: 23.412, longitude: 85.44 } });
  const nit = await prisma.university.create({ data: { name: "NIT Jamshedpur", district: "East Singhbhum", type: "Central", latitude: 22.777, longitude: 86.144 } });
  const ism = await prisma.university.create({ data: { name: "IIT (ISM) Dhanbad", district: "Dhanbad", type: "Central", latitude: 23.813, longitude: 86.441 } });
  const ru = await prisma.university.create({ data: { name: "Ranchi University", district: "Ranchi", type: "State", latitude: 23.375, longitude: 85.324 } });
  const cuj = await prisma.university.create({ data: { name: "Central University of Jharkhand", district: "Ranchi", type: "Central", latitude: 23.42, longitude: 85.44 } });

  // ── Faculty (research areas drive the expertise matcher) ──
  const faculty = [
    { email: "water.prof@bitmesra.ac.in", name: "Dr. A. Verma", uni: bit, dept: "Civil Engineering", desig: "Professor", areas: ["water resources", "hydrology", "groundwater management", "water supply networks"] },
    { email: "env.prof@bitmesra.ac.in", name: "Dr. M. Ekka", uni: bit, dept: "Environmental Engineering", desig: "Associate Professor", areas: ["environment", "pollution control", "waste management", "air quality"] },
    { email: "agri.prof@nitjsr.ac.in", name: "Dr. S. Kumari", uni: nit, dept: "Agricultural Engineering", desig: "Associate Professor", areas: ["agriculture", "soil science", "irrigation", "crop yield", "rural livelihood"] },
    { email: "sanit.prof@nitjsr.ac.in", name: "Dr. P. Mahto", uni: nit, dept: "Civil Engineering", desig: "Assistant Professor", areas: ["sanitation", "sewage treatment", "solid waste", "public health engineering"] },
    { email: "energy.prof@iitism.ac.in", name: "Dr. R. Singh", uni: ism, dept: "Electrical Engineering", desig: "Professor", areas: ["renewable energy", "solar power", "energy storage", "rural electrification"] },
    { email: "it.prof@iitism.ac.in", name: "Dr. N. Oraon", uni: ism, dept: "Computer Science", desig: "Assistant Professor", areas: ["machine learning", "data systems", "digital governance", "software"] },
    { email: "health.prof@cuj.ac.in", name: "Dr. K. Hansda", uni: cuj, dept: "Public Health", desig: "Professor", areas: ["public health", "epidemiology", "rural healthcare", "maternal health"] },
    { email: "edu.prof@ranchiuniv.ac.in", name: "Dr. B. Tirkey", uni: ru, dept: "Education", desig: "Associate Professor", areas: ["education", "digital learning", "teacher training", "tribal education"] },
    { email: "urban.prof@bitmesra.ac.in", name: "Dr. L. Prasad", uni: bit, dept: "Architecture & Planning", desig: "Professor", areas: ["urban planning", "roads and transport", "smart cities", "infrastructure"] },
    { email: "live.prof@ranchiuniv.ac.in", name: "Dr. G. Munda", uni: ru, dept: "Economics", desig: "Assistant Professor", areas: ["rural livelihood", "employment", "microfinance", "tribal development"] },
  ];
  const facultyRows: Record<string, { userId: string; facultyId: string; uniId: string }> = {};
  for (const f of faculty) {
    const dept = await prisma.department.create({ data: { universityId: f.uni.id, name: f.dept } });
    const user = await prisma.user.create({
      data: {
        email: f.email, name: f.name, role: "FACULTY", passwordHash: hash("password"), universityId: f.uni.id,
        facultyProfile: { create: { universityId: f.uni.id, departmentId: dept.id, designation: f.desig, researchAreas: f.areas } },
      },
      include: { facultyProfile: true },
    });
    facultyRows[f.email] = { userId: user.id, facultyId: user.facultyProfile!.id, uniId: f.uni.id };
  }

  // ── Students (for teams) ──
  const students = [
    { email: "priya@bitmesra.ac.in", name: "Priya R.", uni: bit },
    { email: "amit@bitmesra.ac.in", name: "Amit K.", uni: bit },
    { email: "sara@bitmesra.ac.in", name: "Sara G.", uni: bit },
    { email: "nikhil@iitism.ac.in", name: "Nikhil M.", uni: ism },
    { email: "tara@iitism.ac.in", name: "Tara S.", uni: ism },
    { email: "rohit@nitjsr.ac.in", name: "Rohit P.", uni: nit },
  ];
  const studentIds: Record<string, string> = {};
  for (const s of students) {
    const u = await prisma.user.create({ data: { email: s.email, name: s.name, role: "STUDENT", passwordHash: hash("password"), universityId: s.uni.id } });
    studentIds[s.email] = u.id;
  }

  // ── One demo account per role (password = "password") ──
  const citizen = await prisma.user.create({ data: { email: "citizen@demo.in", name: "Ramesh (Citizen)", role: "CITIZEN", passwordHash: hash("password") } });
  await prisma.user.create({ data: { email: "uniadmin@bitmesra.ac.in", name: "BIT Mesra Admin", role: "UNIVERSITY_ADMIN", passwordHash: hash("password"), universityId: bit.id } });
  await prisma.user.create({ data: { email: "student@bitmesra.ac.in", name: "Demo Student", role: "STUDENT", passwordHash: hash("password"), universityId: bit.id } });
  await prisma.user.create({ data: { email: "gov@demo.in", name: "Dept. of Higher Ed", role: "GOVERNMENT", passwordHash: hash("password") } });
  await prisma.user.create({ data: { email: "admin@demo.in", name: "Platform Admin", role: "ADMIN", passwordHash: hash("password") } });

  // ── Industry partners ──
  const industry = [
    { email: "industry@demo.in", company: "SolarWorks Pvt Ltd", sector: "solar energy", offerings: ["FUNDING", "PROTOTYPING", "PILOT"] as const, desc: "Rooftop and micro-grid solar startup across Jharkhand." },
    { email: "agri@demo.in", company: "GreenFields Agritech", sector: "agri-tech", offerings: ["FUNDING", "MENTORING", "TECH_TRANSFER"] as const, desc: "Soil, irrigation and cold-storage solutions for farmers." },
    { email: "itmsme@demo.in", company: "Jharkhand IT Systems (MSME)", sector: "information technology", offerings: ["PROTOTYPING", "MENTORING"] as const, desc: "Local software MSME building civic-tech tools." },
    { email: "csr@demo.in", company: "Jharkhand CSR Foundation", sector: "csr / social", offerings: ["FUNDING"] as const, desc: "Channels corporate CSR funds into local pilots." },
    { email: "waterlab@demo.in", company: "AquaLabs Research", sector: "water technology", offerings: ["PROTOTYPING", "TECH_TRANSFER", "PILOT"] as const, desc: "Low-cost filtration and water-quality research lab." },
  ];
  const industryIds: Record<string, string> = {};
  for (const p of industry) {
    const u = await prisma.user.create({
      data: {
        email: p.email, name: p.company, role: "INDUSTRY", passwordHash: hash("password"),
        industryProfile: { create: { companyName: p.company, sector: p.sector, offerings: [...p.offerings], description: p.desc } },
      },
      include: { industryProfile: true },
    });
    industryIds[p.email] = u.industryProfile!.id;
  }

  // ── The 8 near-duplicate Ranchi water reports (drives clustering) ──
  const waterReports = [
    "No water supply in ward 4 for 3 days after pipeline burst near the station.",
    "Water pipeline broke near Ranchi railway station, whole area is dry.",
    "Ward 4 Ranchi has had no tap water since the main line cracked.",
    "Burst water pipe near station road, no supply for days.",
    "Drinking water stopped in our locality, pipeline damaged near station.",
    "3 days no water ward 4, the pipeline near the railway station is leaking badly.",
    "Water crisis near Ranchi station, broken supply line, please help.",
    "No water in ward 4 area, main pipeline burst, children have no drinking water.",
  ];
  await prisma.problem.createMany({
    data: waterReports.map((description) => ({
      title: "No water supply — Ranchi ward 4", description, category: "WATER" as const, severity: "HIGH" as const,
      district: "Ranchi", latitude: 23.3441, longitude: 85.3096, address: "Ward 4, near railway station, Ranchi", reporterId: citizen.id,
    })),
  });

  // ── ~35 varied problems across districts + categories ──
  const districts = ["Ranchi","Dhanbad","East Singhbhum","Bokaro","Hazaribagh","Giridih","Gumla","Deoghar","Garhwa","Simdega","Palamu","Koderma","Ramgarh","Latehar","Khunti","Dumka","Godda","Sahibganj"];
  const templates: [string, string, string, string][] = [
    ["Frequent power cuts in village", "Under 6 hours of electricity daily; needs a reliable solar solution.", "ENERGY", "HIGH"],
    ["Soil erosion damaging farms", "Heavy erosion is reducing crop yield across several villages.", "AGRICULTURE", "MEDIUM"],
    ["Primary school has no toilets", "Sanitation facilities missing at the government primary school.", "SANITATION", "HIGH"],
    ["Hand pump water is contaminated", "Villagers falling sick; the hand pump water looks and smells bad.", "WATER", "CRITICAL"],
    ["No doctor at the health sub-centre", "The rural health sub-centre has no regular doctor.", "HEALTH", "HIGH"],
    ["Poor mobile and internet connectivity", "Students can't attend online classes due to weak network.", "EDUCATION", "MEDIUM"],
    ["Garbage piling up in the market", "No regular waste collection; garbage rotting near the market.", "SANITATION", "MEDIUM"],
    ["Irrigation canal is broken", "The canal is damaged and fields are not getting water.", "AGRICULTURE", "HIGH"],
    ["Streetlights not working", "Main road is dark at night; unsafe for women and children.", "URBAN", "MEDIUM"],
    ["Pond encroachment and pollution", "The village pond is being filled and polluted with waste.", "ENVIRONMENT", "MEDIUM"],
    ["Anganwadi centre building unsafe", "The anganwadi roof is cracked and leaks in the rain.", "INFRASTRUCTURE", "HIGH"],
    ["No employment for tribal youth", "Youth are migrating out; need local livelihood options.", "RURAL_LIVELIHOOD", "MEDIUM"],
    ["Road washed away in monsoon", "The approach road is broken; village cut off during rains.", "INFRASTRUCTURE", "HIGH"],
    ["Vaccine cold storage failing", "Rural clinic can't keep vaccines cold due to power cuts.", "HEALTH", "HIGH"],
    ["Crop pest outbreak", "A pest is destroying paddy across the block.", "AGRICULTURE", "HIGH"],
    ["Solar street lights needed", "Village wants solar street lights where grid is unreliable.", "ENERGY", "MEDIUM"],
    ["School lacks drinking water", "Children carry water from home; school has no supply.", "WATER", "HIGH"],
    ["Open drains near houses", "Open drains breeding mosquitoes; dengue risk rising.", "SANITATION", "HIGH"],
    ["Forest area being cut illegally", "Illegal felling near the reserve is increasing.", "ENVIRONMENT", "MEDIUM"],
    ["Certificates require many trips", "Getting caste/income certificates needs many office visits.", "GOVERNANCE", "LOW"],
    ["No ramp at the block office", "Differently-abled people can't access the block office.", "ACCESSIBILITY", "MEDIUM"],
    ["Bridge is dangerously narrow", "The old bridge is too narrow and cracked.", "INFRASTRUCTURE", "HIGH"],
    ["Weak learning outcomes in maths", "Students struggle with maths; need better teaching support.", "EDUCATION", "MEDIUM"],
    ["Borewell has run dry", "The main borewell has dried up this summer.", "WATER", "CRITICAL"],
    ["No cold storage for vegetables", "Farmers lose vegetables due to no nearby cold storage.", "AGRICULTURE", "MEDIUM"],
    ["Frequent transformer failures", "The local transformer keeps failing, damaging appliances.", "ENERGY", "MEDIUM"],
    ["Malnutrition among children", "Several children show signs of malnutrition.", "HEALTH", "HIGH"],
    ["Plastic waste choking the stream", "Plastic waste is blocking the village stream.", "ENVIRONMENT", "MEDIUM"],
    ["No public transport to town", "No regular bus; people walk long distances.", "URBAN", "MEDIUM"],
    ["Toilets built but no water", "Toilets constructed but unusable without water.", "SANITATION", "MEDIUM"],
    ["Girls dropping out of school", "Girls leave school early; safety and toilets are issues.", "EDUCATION", "HIGH"],
    ["Flooding in low-lying colony", "The colony floods every monsoon due to poor drainage.", "URBAN", "HIGH"],
    ["Fluoride in drinking water", "High fluoride reported; people have joint problems.", "WATER", "CRITICAL"],
    ["No skill training centre", "Youth want a nearby skill/vocational training centre.", "RURAL_LIVELIHOOD", "MEDIUM"],
    ["Health data not digitised", "Sub-centre records are on paper; hard to track patients.", "GOVERNANCE", "LOW"],
  ];
  await prisma.problem.createMany({
    data: templates.map((t, i) => ({
      title: t[0], description: t[1], category: t[2] as never, severity: t[3] as never,
      district: districts[i % districts.length]!, reporterId: citizen.id,
    })),
  });

  // ── Completed / in-flight project chains (make the NEP dashboard non-empty) ──
  async function buildStory(opts: {
    title: string; description: string; category: string; district: string;
    facultyEmail: string; studentEmails: string[]; teamName: string;
    proposalTitle: string; projectTitle: string; projectStatus: string; matchScore: number; reason: string;
    partnerEmail?: string; funding?: number; outcomes?: { type: string; title: string; details?: string }[];
  }) {
    const fac = facultyRows[opts.facultyEmail]!;
    const problem = await prisma.problem.create({
      data: {
        title: opts.title, description: opts.description, category: opts.category as never, severity: "HIGH",
        district: opts.district, reporterId: citizen.id, status: opts.projectStatus === "DEPLOYED" ? "RESOLVED" : "IN_PROGRESS",
      },
    });
    await prisma.assignment.create({ data: { problemId: problem.id, universityId: fac.uniId, facultyId: fac.facultyId, matchScore: opts.matchScore, reason: opts.reason } });
    const team = await prisma.team.create({ data: { problemId: problem.id, universityId: fac.uniId, name: opts.teamName, mentorId: fac.userId } });
    for (const se of opts.studentEmails) {
      if (studentIds[se]) await prisma.teamMember.create({ data: { teamId: team.id, userId: studentIds[se]! } });
    }
    await prisma.proposal.create({ data: { problemId: problem.id, title: opts.proposalTitle, description: opts.description, approach: "Survey → prototype → pilot → handover.", status: "APPROVED", submittedAt: new Date() } });
    const project = await prisma.project.create({ data: { problemId: problem.id, title: opts.projectTitle, status: opts.projectStatus as never } });
    await prisma.milestone.createMany({ data: [
      { projectId: project.id, title: "Site survey", status: "DONE", order: 1 },
      { projectId: project.id, title: "Prototype", status: opts.projectStatus === "DEPLOYED" ? "DONE" : "IN_PROGRESS", order: 2 },
      { projectId: project.id, title: "Pilot & deploy", status: opts.projectStatus === "DEPLOYED" ? "DONE" : "TODO", order: 3 },
    ] });
    if (opts.partnerEmail && industryIds[opts.partnerEmail]) {
      await prisma.partnership.create({ data: { projectId: project.id, partnerId: industryIds[opts.partnerEmail]!, role: "FUNDING", fundingCommitted: opts.funding ?? 0, pilotStatus: opts.projectStatus === "DEPLOYED" ? "complete" : "running" } });
    }
    for (const o of opts.outcomes ?? []) {
      await prisma.outcome.create({ data: { projectId: project.id, type: o.type as never, title: o.title, details: o.details } });
    }
    return { problem, project };
  }

  const s1 = await buildStory({
    title: "Low-cost decentralised water supply — Ranchi ward 4", description: "Resilient community water supply after repeated pipeline failures.",
    category: "WATER", district: "Ranchi", facultyEmail: "water.prof@bitmesra.ac.in", studentEmails: ["priya@bitmesra.ac.in", "amit@bitmesra.ac.in", "sara@bitmesra.ac.in"],
    teamName: "Ranchi Water Access Team", proposalTitle: "Low-cost decentralised water supply for ward 4", projectTitle: "Water access — ward 4",
    projectStatus: "DEPLOYED", matchScore: 0.88, reason: "matched on: water resources, hydrology, water supply networks",
    partnerEmail: "waterlab@demo.in", funding: 250000, outcomes: [{ type: "PATENT", title: "Low-cost gravity water filter", details: "Patent filed" }, { type: "DEPLOYMENT", title: "Deployed in ward 4" }, { type: "PUBLICATION", title: "Decentralised supply case study" }],
  });

  await buildStory({
    title: "Solar micro-grid for a village", description: "Reliable rural electrification via a community solar micro-grid.",
    category: "ENERGY", district: "Dhanbad", facultyEmail: "energy.prof@iitism.ac.in", studentEmails: ["nikhil@iitism.ac.in", "tara@iitism.ac.in"],
    teamName: "GridSpark Team", proposalTitle: "Solar micro-grid pilot for rural electrification", projectTitle: "Solar micro-grid — pilot",
    projectStatus: "DEPLOYED", matchScore: 0.86, reason: "matched on: renewable energy, solar power, rural electrification",
    partnerEmail: "industry@demo.in", funding: 400000, outcomes: [{ type: "STARTUP", title: "GridSpark Energy (student startup)" }, { type: "DEPLOYMENT", title: "Micro-grid live in village" }],
  });

  await buildStory({
    title: "Solar cold-storage for farm produce", description: "Reduce post-harvest loss with solar cold-storage.",
    category: "AGRICULTURE", district: "East Singhbhum", facultyEmail: "agri.prof@nitjsr.ac.in", studentEmails: ["rohit@nitjsr.ac.in"],
    teamName: "AgriCool Team", proposalTitle: "Solar cold-storage for vegetables", projectTitle: "Solar cold-storage pilot",
    projectStatus: "IN_EXECUTION", matchScore: 0.81, reason: "matched on: agriculture, soil science, irrigation",
    partnerEmail: "agri@demo.in", funding: 150000, outcomes: [{ type: "PUBLICATION", title: "Cold-storage feasibility report" }],
  });

  // ── A couple of notifications for the demo ──
  await prisma.notification.createMany({ data: [
    { userId: citizen.id, type: "PROBLEM_ROUTED", message: "Your report was routed to Dr. A. Verma, BIT Mesra.", link: `/citizen/submissions` },
    { userId: citizen.id, type: "OUTCOME_RECORDED", message: "A patent was filed for the ward-4 water project.", link: `/project/${s1.project.id}` },
    { userId: facultyRows["water.prof@bitmesra.ac.in"]!.userId, type: "PROBLEM_ROUTED", message: "A new water problem (reported by 8) was routed to you.", link: `/university` },
  ] });

  const counts = {
    universities: await prisma.university.count(),
    faculty: await prisma.facultyProfile.count(),
    students: await prisma.user.count({ where: { role: "STUDENT" } }),
    problems: await prisma.problem.count(),
    industry: await prisma.industryProfile.count(),
    projects: await prisma.project.count(),
    outcomes: await prisma.outcome.count(),
  };
  console.log("Seed complete:", JSON.stringify(counts));
  console.log("Demo logins (password 'password'): citizen@demo.in / uniadmin@bitmesra.ac.in / industry@demo.in / gov@demo.in / admin@demo.in");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
