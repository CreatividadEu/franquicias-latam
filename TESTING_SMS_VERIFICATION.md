# SMS Verification Testing Guide

## Priority 1 Fixes - Testing Documentation

This document outlines how to test the critical SMS verification bug fixes that were implemented.

---

## What Was Fixed

### 🐛 **Critical Bug**
The SMS verification flow had a critical disconnect between Twilio verification and database records:

- **Production (Twilio enabled)**: Verification happened via Twilio API, but no database record was created
- **Lead Creation**: Always checked database for verification status
- **Result**: Lead creation would fail even after successful SMS verification

### ✅ **The Fix**
1. **[api/sms/verify/route.ts](src/app/api/sms/verify/route.ts)** - Now creates a DB record after Twilio verification succeeds
2. **[api/leads/route.ts](src/app/api/leads/route.ts)** - Improved verification check with expiry validation
3. **Error Logging** - Added comprehensive error logging across all verification endpoints

---

## Testing Scenarios

### **Scenario 1: Development Mode (No Twilio)**

This tests the dev fallback path where SMS codes are stored in the database.

#### Prerequisites
```bash
# Ensure Twilio env vars are NOT set or commented out in .env
# TWILIO_ACCOUNT_SID=""
# TWILIO_AUTH_TOKEN=""
# TWILIO_VERIFY_SERVICE_SID=""
```

#### Steps
1. **Start the dev server**
   ```bash
   npm run dev
   ```

2. **Navigate to the quiz**
   ```
   http://localhost:3000/quiz
   ```

3. **Complete the quiz steps**
   - Select sectors
   - Choose investment range
   - Select country
   - Choose experience level

4. **Submit contact info**
   - Enter name, email, and phone (format: +573001234567)
   - Click "Continuar"

5. **Check server logs**
   ```
   [sms/send] dev fallback path
   [sms/send] response sent
   ```

   In development, the OTP code will be logged:
   ```
   { code: "123456" }
   ```

6. **Enter the verification code**
   - Use the code from the logs (or `123456` if no code shown)
   - Click "Verificar"

7. **Verify the flow**
   - Check logs for:
     ```
     [sms/verify] dev fallback path
     [leads/POST] Phone verified successfully
     ```
   - You should see franchise matches displayed

8. **Verify database records**
   ```bash
   npm run db:studio
   ```

   Check `SmsVerification` table:
   - Should have a record with `verified: true`
   - Phone number should match

   Check `Lead` table:
   - New lead created with `phoneVerified: true`

---

### **Scenario 2: Production Mode (Twilio Enabled)**

This tests the real Twilio integration path.

#### Prerequisites
```bash
# .env must have valid Twilio credentials
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_VERIFY_SERVICE_SID="VA..."
```

#### Steps
1. **Start the server**
   ```bash
   npm run dev
   # or in production
   npm run build && npm start
   ```

2. **Complete the quiz** (same as Scenario 1 steps 2-4)

3. **Submit contact info with REAL phone number**
   - Must be a real phone that can receive SMS
   - Format: `+[country_code][number]`
   - Example: `+573001234567` (Colombia)

4. **Check server logs**
   ```
   [sms/send] twilio path
   [sms/send] response sent
   ```

5. **Receive SMS**
   - You should receive a real SMS with a 6-digit code
   - Twilio sends from a shortcode (like 74618)

6. **Enter the REAL verification code**
   - Enter the code from your SMS
   - Click "Verificar"

7. **Verify the flow**
   - Check logs for:
     ```
     [sms/verify] twilio path
     [sms/verify] creating verification record
     [leads/POST] Phone verified successfully
     ```
   - You should see franchise matches

8. **Verify database records**
   ```bash
   npm run db:studio
   ```

   Check `SmsVerification` table:
   - Should have a record with:
     - `code: "TWILIO_VERIFIED"`
     - `verified: true`
     - `expiresAt`: 30 days from now

   Check `Lead` table:
   - New lead created with `phoneVerified: true`

---

### **Scenario 3: Error Cases**

#### Test Invalid Phone Number
```bash
# Submit phone: "123"
# Expected: 400 error "Numero de telefono invalido"
```

#### Test Rate Limiting
```bash
# Send SMS to same number 4 times within 1 hour
# Expected: 4th attempt returns 429 "Demasiados intentos. Intenta en 1 hora."
```

#### Test Expired Code (Dev Mode)
```bash
# 1. Send SMS
# 2. Wait 11 minutes (expiry is 10 minutes)
# 3. Try to verify
# Expected: 400 "Codigo invalido o expirado"
```

#### Test Wrong Code
```bash
# Enter code: "000000"
# Expected: 400 "Codigo invalido o expirado"
```

#### Test Lead Creation Without Verification
```bash
# Use curl to bypass frontend and call /api/leads directly
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+573009999999",
    "sectors": ["sector-id"],
    "investmentRange": "RANGE_50K_100K",
    "countryId": "country-id",
    "experienceLevel": "INVERSOR"
  }'

# Expected: 403 "El telefono no ha sido verificado. Por favor completa la verificacion SMS."
```

---

## Database Verification Queries

### Check Verification Records
```sql
-- Via Prisma Studio or direct SQL
SELECT * FROM sms_verifications
WHERE phone = '+573001234567'
ORDER BY "createdAt" DESC
LIMIT 5;
```

### Check Leads with Verification Status
```sql
SELECT
  id,
  name,
  phone,
  "phoneVerified",
  "createdAt"
FROM leads
WHERE phone = '+573001234567';
```

### Cleanup Test Data
```sql
-- Delete test verifications
DELETE FROM sms_verifications WHERE phone = '+573001234567';

-- Delete test leads
DELETE FROM leads WHERE email = 'test@example.com';
```

---

## Monitoring & Logs

### Key Log Messages to Watch

#### Success Path
```
[sms/send] request received
[sms/send] twilio path (or dev fallback path)
[sms/send] response sent
[sms/verify] request received
[sms/verify] twilio path (or dev fallback path)
[sms/verify] creating verification record
[leads/POST] Phone verified successfully
```

#### Error Path
```
[sms/send] invalid phone
[sms/send] rate limited
[sms/verify] twilio code invalid
[leads/POST] Phone verification failed
```

---

## Common Issues & Troubleshooting

### Issue: "Phone not verified" error in production
**Cause**: Missing Twilio credentials or network issue
**Solution**: Check `.env` file has valid Twilio credentials

### Issue: No SMS received
**Cause**:
- Invalid phone format
- Twilio account not funded
- Phone number not verified in Twilio trial account

**Solution**:
- Verify phone format includes country code
- Check Twilio console for errors
- Add phone to Twilio verified numbers list (trial accounts)

### Issue: Duplicate verification records
**Fix Applied**: Code now checks for existing verified records before creating new ones

### Issue: Verification expired
**Behavior**:
- Dev mode: 10 minutes
- Production: 30 days (after Twilio verification)

---

## Manual API Testing with curl

### Send SMS
```bash
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "+573001234567"}'
```

### Verify Code
```bash
curl -X POST http://localhost:3000/api/sms/verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "+573001234567", "code": "123456"}'
```

### Create Lead
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+573001234567",
    "sectors": ["<sector-id>"],
    "investmentRange": "RANGE_100K_200K",
    "countryId": "<country-id>",
    "experienceLevel": "INVERSOR"
  }'
```

---

## Success Criteria

✅ **Dev Mode**
- [ ] Can complete full quiz flow without Twilio credentials
- [ ] Verification code appears in logs
- [ ] Database record created with correct expiry (10 min)
- [ ] Lead creation succeeds after verification

✅ **Production Mode**
- [ ] SMS received on real phone number
- [ ] Twilio verification succeeds
- [ ] Database record created with code "TWILIO_VERIFIED"
- [ ] Database record has 30-day expiry
- [ ] Lead creation succeeds after verification
- [ ] No duplicate verification records created

✅ **Error Handling**
- [ ] Invalid phone numbers rejected
- [ ] Rate limiting works (3 attempts/hour)
- [ ] Expired codes rejected
- [ ] Wrong codes rejected
- [ ] Lead creation fails without verification
- [ ] All errors logged properly

✅ **Database Integrity**
- [ ] No orphaned verification records
- [ ] Lead.phoneVerified matches SmsVerification.verified
- [ ] Expiry dates are correct for both modes

---

## Next Steps After Testing

If all tests pass:
1. ✅ Mark Priority 1 as complete
2. 🚀 Deploy to production
3. 📊 Monitor logs for any issues
4. 🧹 Clean up test data from database

If issues found:
1. 📝 Document the failure scenario
2. 🔍 Check logs for error messages
3. 🛠️ Fix and re-test
4. 📊 Update this document with new findings
