import { PrismaClient } from "../lib/generated/prisma";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

// costPerCone = realistic per-cone wholesale price (India, mid-2026), assuming a
// ~1.89 kg industrial cone: per-cone ≈ market ₹/kg × 1.89. See research notes.
const yarns = [
  { name: "Cotton Combed 30s", material: "Cotton", color: "White", quantity: 240, costPerCone: 550, reorderLevel: 50, location: "Rack A-1", supplier: "Sri Lakshmi Mills" },
  { name: "Cotton Combed 40s", material: "Cotton", color: "Off White", quantity: 38, costPerCone: 580, reorderLevel: 50, location: "Rack A-2", supplier: "Sri Lakshmi Mills" },
  { name: "Polyester Spun 20s", material: "Polyester", color: "Black", quantity: 160, costPerCone: 285, reorderLevel: 60, location: "Rack A-12", supplier: "Reliance Yarns" },
  { name: "Viscose 30s", material: "Viscose", color: "Navy Blue", quantity: 72, costPerCone: 380, reorderLevel: 50, location: "Rack B-1", supplier: "Grasim Industries" },
  { name: "Acrylic High Bulk", material: "Acrylic", color: "Maroon", quantity: 18, costPerCone: 380, reorderLevel: 40, location: "Rack B-3", supplier: "Vardhman Textiles" },
  { name: "Linen Blend 25s", material: "Linen", color: "Beige", quantity: 95, costPerCone: 1040, reorderLevel: 50, location: "Rack B-7", supplier: "Jaya Shree Textiles" },
  { name: "Cotton Carded 20s", material: "Cotton", color: "Grey Melange", quantity: 310, costPerCone: 470, reorderLevel: 80, location: "Rack C-2", supplier: "KPR Mills" },
  { name: "Wool Merino 2/30", material: "Wool", color: "Charcoal", quantity: 26, costPerCone: 2080, reorderLevel: 30, location: "Rack C-5", supplier: "Raymond UCO" },
  { name: "Modal 40s", material: "Modal", color: "Teal", quantity: 140, costPerCone: 455, reorderLevel: 50, location: "Rack C-9", supplier: "Birla Cellulose" },
  { name: "Nylon Textured 70D", material: "Nylon", color: "Red", quantity: 44, costPerCone: 285, reorderLevel: 50, location: "Rack D-1", supplier: "Century Enka" },
];

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.yarn.deleteMany();
  await prisma.user.deleteMany();

  // Default logins. Change the passwords after first sign-in.
  await prisma.user.create({
    data: {
      email: "admin@gmail.com",
      name: "Warehouse Admin",
      role: "admin",
      passwordHash: await hashPassword("admin123"),
    },
  });
  await prisma.user.create({
    data: {
      email: "staff@gmail.com",
      name: "Warehouse Staff",
      role: "staff",
      passwordHash: await hashPassword("staff123"),
    },
  });

  for (let i = 0; i < yarns.length; i++) {
    const y = yarns[i];
    const yarnId = `Y${String(i + 1).padStart(3, "0")}`;
    const created = await prisma.yarn.create({
      data: { ...y, yarnId, createdAt: daysAgo(yarns.length - i) },
    });

    // A couple of seed movements per yarn across recent months for the reports chart.
    await prisma.transaction.create({
      data: { yarnId: created.id, type: "IN", quantity: y.quantity + 20, date: daysAgo(40 + i) },
    });
    await prisma.transaction.create({
      data: { yarnId: created.id, type: "OUT", quantity: 20, date: daysAgo(10 + i) },
    });
  }

  const count = await prisma.yarn.count();
  console.log(`Seeded ${count} yarns with sample transactions.`);
  console.log("Admin login: admin@gmail.com / admin123");
  console.log("Staff login: staff@gmail.com / staff123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
