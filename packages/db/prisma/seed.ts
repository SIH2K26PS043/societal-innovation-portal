/**
 * Seed data — Jharkhand universities, faculty, demo users for every role, and
 * citizen problems (with deliberate DUPLICATES so clustering visibly fires).
 *
 * Run:  pnpm db:seed
 * After seeding, run the AI backfill so vector columns are populated:
 *   cd apps/ai && python -m app.scripts.backfill_embeddings   (see apps/ai/README.md)
 *
 * This is a STARTER seed (M1 + M6 expand it on Day 4/6). Keep the 8 Ranchi water
 * duplicates — they are the money shot of the demo.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const hash = (pw: string) => bcrypt.hashSync(pw, 10);

async function main() {
  console.log("Seeding…");

  // ── Universities ──
  const bitMesra = await prisma.university.create({
    data: { name: "BIT Mesra", district: "Ranchi", type: "Deemed", website: "https://www.bitmesra.ac.in" },
  });
  const nitJsr = await prisma.university.create({
    data: { name: "NIT Jamshedpur", district: "East Singhbhum", type: "Central" },
  });
  const ismDhanbad = await prisma.university.create({
    data: { name: "IIT (ISM) Dhanbad", district: "Dhanbad", type: "Central" },
  });

  // ── Departments + Faculty (research areas seed the expertise matcher) ──
  const civilBit = await prisma.department.create({ data: { universityId: bitMesra.id, name: "Civil Engineering" } });
  const cseBit = await prisma.department.create({ data: { universityId: bitMesra.id, name: "Computer Science" } });

  const profWater = await prisma.user.create({
    data: {
      email: "water.prof@bitmesra.ac.in", name: "Dr. A. Verma", role: "FACULTY",
      passwordHash: hash("password"), universityId: bitMesra.id,
      facultyProfile: {
        create: {
          universityId: bitMesra.id, departmentId: civilBit.id, designation: "Professor",
          researchAreas: ["water resources", "hydrology", "groundwater management", "water supply networks"],
        },
      },
    },
  });
  await prisma.user.create({
    data: {
      email: "agri.prof@nitjsr.ac.in", name: "Dr. S. Kumari", role: "FACULTY",
      passwordHash: hash("password"), universityId: nitJsr.id,
      facultyProfile: {
        create: {
          universityId: nitJsr.id, designation: "Associate Professor",
          researchAreas: ["agriculture", "soil science", "irrigation", "crop yield", "rural livelihood"],
        },
      },
    },
  });
  await prisma.user.create({
    data: {
      email: "energy.prof@iitism.ac.in", name: "Dr. R. Singh", role: "FACULTY",
      passwordHash: hash("password"), universityId: ismDhanbad.id,
      facultyProfile: {
        create: {
          universityId: ismDhanbad.id, designation: "Professor",
          researchAreas: ["renewable energy", "solar power", "energy storage", "rural electrification"],
        },
      },
    },
  });

  // ── One demo account per role (password = "password") ──
  const citizen = await prisma.user.create({
    data: { email: "citizen@demo.in", name: "Ramesh (Citizen)", role: "CITIZEN", passwordHash: hash("password") },
  });
  await prisma.user.create({
    data: { email: "uniadmin@bitmesra.ac.in", name: "BIT Mesra Admin", role: "UNIVERSITY_ADMIN", passwordHash: hash("password"), universityId: bitMesra.id },
  });
  await prisma.user.create({
    data: { email: "student@bitmesra.ac.in", name: "Priya (Student)", role: "STUDENT", passwordHash: hash("password"), universityId: bitMesra.id },
  });
  await prisma.user.create({
    data: {
      email: "industry@demo.in", name: "SolarWorks MSME", role: "INDUSTRY", passwordHash: hash("password"),
      industryProfile: { create: { companyName: "SolarWorks Pvt Ltd", sector: "solar energy", offerings: ["FUNDING", "PROTOTYPING", "PILOT"], description: "Rooftop and micro-grid solar startup." } },
    },
  });
  await prisma.user.create({
    data: { email: "gov@demo.in", name: "Dept. of Higher Ed", role: "GOVERNMENT", passwordHash: hash("password") },
  });
  await prisma.user.create({
    data: { email: "admin@demo.in", name: "Platform Admin", role: "ADMIN", passwordHash: hash("password") },
  });

  // ── Citizen problems: 8 near-duplicate Ranchi water reports (drives clustering) ──
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
  for (const desc of waterReports) {
    await prisma.problem.create({
      data: {
        title: "No water supply — Ranchi ward 4",
        description: desc,
        category: "WATER",
        severity: "HIGH",
        district: "Ranchi",
        latitude: 23.3441, longitude: 85.3096,
        address: "Ward 4, near railway station, Ranchi",
        reporterId: citizen.id,
      },
    });
  }

  // ── A few varied problems across districts/categories ──
  await prisma.problem.create({ data: { title: "Soil erosion damaging farms", description: "Heavy soil erosion is reducing crop yield across several villages.", category: "AGRICULTURE", severity: "MEDIUM", district: "East Singhbhum", reporterId: citizen.id } });
  await prisma.problem.create({ data: { title: "Frequent power cuts in village", description: "Rural area gets under 6 hours of electricity; needs a reliable solar solution.", category: "ENERGY", severity: "MEDIUM", district: "Dhanbad", reporterId: citizen.id } });
  await prisma.problem.create({ data: { title: "Primary school has no toilets", description: "Sanitation facilities missing at the government primary school.", category: "SANITATION", severity: "HIGH", district: "Gumla", reporterId: citizen.id } });

  console.log("Seed complete. Demo logins: citizen@demo.in / uniadmin@bitmesra.ac.in / industry@demo.in / gov@demo.in / admin@demo.in — password: 'password'");
  console.log(`Water professor for matching demo: ${profWater.email}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
