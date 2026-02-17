#!/usr/bin/env node

const phone = process.argv[2]?.trim();
const url = process.env.SMS_SEND_URL ?? "http://localhost:3000/api/sms/send";

if (!phone) {
  console.error("Usage: node scripts/smoke_send_sms.mjs +34XXXXXXXXX");
  process.exit(1);
}

async function main() {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
    });

    let payload;
    try {
      payload = await response.json();
    } catch {
      payload = { error: "Invalid JSON response" };
    }

    console.log(`status: ${response.status}`);
    console.log(JSON.stringify(payload, null, 2));
  } catch (error) {
    console.error("request_failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

main();
