import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkVerifications() {
  const phone = "+573108649290";

  console.log("\n🔍 Checking verifications for:", phone);
  console.log("━".repeat(60));

  const verifications = await prisma.smsVerification.findMany({
    where: { phone },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  if (verifications.length === 0) {
    console.log("❌ No verification records found");
  } else {
    verifications.forEach((v, i) => {
      console.log(`\n${i + 1}. Record ID: ${v.id}`);
      console.log(`   Code: ${v.code}`);
      console.log(`   Verified: ${v.verified ? "✅" : "❌"}`);
      console.log(`   Created: ${v.createdAt.toISOString()}`);
      console.log(`   Expires: ${v.expiresAt.toISOString()}`);
      console.log(
        `   Status: ${
          v.verified
            ? "VERIFIED"
            : v.expiresAt > new Date()
            ? "ACTIVE"
            : "EXPIRED"
        }`
      );
    });
  }

  console.log("\n━".repeat(60));
  console.log("\n🧹 Cleaning up unverified records...");

  const deleted = await prisma.smsVerification.deleteMany({
    where: {
      phone,
      verified: false,
    },
  });

  console.log(`✅ Deleted ${deleted.count} unverified record(s)`);

  await prisma.$disconnect();
}

checkVerifications().catch(console.error);
