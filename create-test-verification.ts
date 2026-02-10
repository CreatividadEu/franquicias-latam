import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestVerification() {
  const phone = "+573108649290";
  const code = "123456";

  // Clean up old records
  await prisma.smsVerification.deleteMany({
    where: { phone },
  });

  // Create fresh verification
  const verification = await prisma.smsVerification.create({
    data: {
      phone,
      code,
      verified: false,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
  });

  console.log("\n✅ Created test verification:");
  console.log("━".repeat(60));
  console.log(`📱 Phone: ${phone}`);
  console.log(`🔐 Code: ${code}`);
  console.log(`⏰ Expires: ${verification.expiresAt.toISOString()}`);
  console.log("━".repeat(60));
  console.log("\n✨ You can now verify with code: 123456\n");

  await prisma.$disconnect();
}

createTestVerification().catch(console.error);
