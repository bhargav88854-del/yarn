import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

const yarns = [
  { name: "Cotton Combed 30s", material: "Cotton", color: "White", quantity: 240, location: "Rack A-1", supplier: "Sri Lakshmi Mills" },
  { name: "Cotton Combed 40s", material: "Cotton", color: "Off White", quantity: 38, location: "Rack A-2", supplier: "Sri Lakshmi Mills" },
  { name: "Polyester Spun 20s", material: "Polyester", color: "Black", quantity: 160, location: "Rack A-12", supplier: "Reliance Yarns" },
  { name: "Viscose 30s", material: "Viscose", color: "Navy Blue", quantity: 72, location: "Rack B-1", supplier: "Grasim Industries" },
  { name: "Acrylic High Bulk", material: "Acrylic", color: "Maroon", quantity: 18, location: "Rack B-3", supplier: "Vardhman Textiles" },
  { name: "Linen Blend 25s", material: "Linen", color: "Beige", quantity: 95, location: "Rack B-7", supplier: "Jaya Shree Textiles" },
  { name: "Cotton Carded 20s", material: "Cotton", color: "Grey Melange", quantity: 310, location: "Rack C-2", supplier: "KPR Mills" },
  { name: "Wool Merino 2/30", material: "Wool", color: "Charcoal", quantity: 26, location: "Rack C-5", supplier: "Raymond UCO" },
  { name: "Modal 40s", material: "Modal", color: "Teal", quantity: 140, location: "Rack C-9", supplier: "Birla Cellulose" },
  { name: "Nylon Textured 70D", material: "Nylon", color: "Red", quantity: 44, location: "Rack D-1", supplier: "Century Enka" },
];

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.yarn.deleteMany();

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
