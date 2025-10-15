const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // user
  const user1 = await prisma.user.create({
    data: { name: "Alice", email: "alice@example.com" },
  });

  const user2 = await prisma.user.create({
    data: { name: "Bob", email: "bob@example.com" },
  });

  // event
  const event1 = await prisma.event.create({
    data: {
      title: "Tech Meetup",
      date: new Date("2025-11-20T18:00:00.000Z"),
      location: "Burdwan",
      capacity: 100,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: "Node.js Workshop",
      date: new Date("2025-12-05T15:00:00.000Z"),
      location: "Kolkata",
      capacity: 50,
    },
  });

  console.log("Seed data created!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
