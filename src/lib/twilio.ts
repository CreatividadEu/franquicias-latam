import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client =
  accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function sendVerificationCode(phone: string): Promise<boolean> {
  // Dev bypass: skip Twilio in development when no credentials are set
  if (!client || !verifySid) {
    console.log(`[DEV] SMS code for ${phone}: 123456`);
    return true;
  }

  const verification = await client.verify.v2
    .services(verifySid)
    .verifications.create({ to: phone, channel: "sms" });

  return verification.status === "pending";
}

export async function checkVerificationCode(
  phone: string,
  code: string
): Promise<boolean> {
  // Dev bypass: accept 123456 when no Twilio credentials
  if (!client || !verifySid) {
    return code === "123456";
  }

  const check = await client.verify.v2
    .services(verifySid)
    .verificationChecks.create({ to: phone, code });

  return check.status === "approved";
}
