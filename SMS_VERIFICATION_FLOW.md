# SMS Verification Flow - Quick Reference

## 🔄 **Complete Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                                 │
└─────────────────────────────────────────────────────────────────────┘

1. User completes quiz (sectors, investment, country, experience)
                            ↓
2. User enters contact info (name, email, phone)
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    POST /api/sms/send                                │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─── Is Twilio Configured? ───┐                                     │
│ │                               │                                     │
│ NO (Dev)                      YES (Production)                       │
│ │                               │                                     │
│ ├─ Generate 6-digit code       ├─ Call Twilio API                   │
│ ├─ Store in DB                 ├─ Twilio sends SMS                  │
│ │  - verified: false           │                                     │
│ │  - expiresAt: +10 min        │                                     │
│ └─ Return { code } in dev      └─ Return { ok: true }               │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
3. User receives SMS (or sees code in logs for dev)
                            ↓
4. User enters verification code
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   POST /api/sms/verify                               │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─── Is Twilio Configured? ───┐                                     │
│ │                               │                                     │
│ NO (Dev)                      YES (Production)                       │
│ │                               │                                     │
│ ├─ Find DB record              ├─ Call Twilio verify API            │
│ ├─ Compare code                ├─ If valid:                         │
│ ├─ Update verified=true        │   ├─ Check for existing record     │
│ │                               │   ├─ Create new DB record:         │
│ │                               │   │  - code: "TWILIO_VERIFIED"     │
│ │                               │   │  - verified: true               │
│ │                               │   │  - expiresAt: +30 days         │
│ └─ Return { verified: true }   └─ Return { verified: true }         │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
5. Frontend calls POST /api/leads with all quiz data
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     POST /api/leads                                  │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Validate all fields                                               │
│ 2. Check phone verification:                                         │
│    ├─ Query DB for verified=true AND not expired                    │
│    └─ If not found → 403 error                                      │
│ 3. Create Lead record (phoneVerified: true)                         │
│ 4. Run matching algorithm                                            │
│ 5. Create LeadFranchiseMatch records                                │
│ 6. Send email notification (async)                                  │
│ 7. Return { leadId, matches }                                       │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
6. User sees matched franchises
```

---

## 🗄️ **Database Schema**

```sql
-- SMS Verification Table
CREATE TABLE sms_verifications (
  id          TEXT PRIMARY KEY,
  phone       TEXT NOT NULL,
  code        TEXT NOT NULL,         -- 6-digit OTP or "TWILIO_VERIFIED"
  verified    BOOLEAN DEFAULT false,
  expiresAt   TIMESTAMP NOT NULL,    -- +10 min (dev) or +30 days (prod)
  createdAt   TIMESTAMP DEFAULT NOW()
);

-- Lead Table
CREATE TABLE leads (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT NOT NULL,
  phoneVerified   BOOLEAN DEFAULT false,  -- ✅ Must be true
  countryId       TEXT NOT NULL,
  investmentRange TEXT NOT NULL,
  experienceLevel TEXT NOT NULL,
  viewed          BOOLEAN DEFAULT false,
  createdAt       TIMESTAMP DEFAULT NOW(),
  updatedAt       TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 **Security Features**

### Rate Limiting
```typescript
// Max 3 SMS per phone per hour
const recentAttempts = await prisma.smsVerification.count({
  where: {
    phone,
    createdAt: { gte: oneHourAgo }
  }
});
if (recentAttempts >= 3) {
  return 429; // Too Many Requests
}
```

### Phone Validation
```typescript
const phoneValid = /^\+?\d{7,15}$/.test(phone);
// Must be 7-15 digits, optional + prefix
```

### Expiry Validation
```typescript
// Dev: 10 minutes
expiresAt: new Date(Date.now() + 10 * 60 * 1000)

// Production: 30 days
expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
```

---

## 🧪 **Testing Quick Commands**

### Development Mode Test
```bash
# 1. Ensure no Twilio vars in .env
# 2. Start server
npm run dev

# 3. In browser
# Go to http://localhost:3000/quiz
# Complete quiz, use any phone like +573001234567
# Use code: 123456 (or check logs)

# 4. Verify database
npm run db:studio
# Check sms_verifications and leads tables
```

### Production Mode Test
```bash
# 1. Set Twilio vars in .env
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_VERIFY_SERVICE_SID="VA..."

# 2. Start server
npm run dev

# 3. Use REAL phone number
# Complete quiz with real phone (+573001234567)
# Wait for SMS
# Enter real code

# 4. Check logs for
# "[sms/verify] creating verification record"
```

### API Testing
```bash
# Send SMS
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{"phone":"+573001234567"}'

# Verify (dev)
curl -X POST http://localhost:3000/api/sms/verify \
  -H "Content-Type: application/json" \
  -d '{"phone":"+573001234567","code":"123456"}'

# Create lead (replace IDs)
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test",
    "email":"test@test.com",
    "phone":"+573001234567",
    "sectors":["sector-id"],
    "investmentRange":"RANGE_100K_200K",
    "countryId":"country-id",
    "experienceLevel":"INVERSOR"
  }'
```

---

## 🐛 **Common Errors & Solutions**

| Error | Cause | Solution |
|-------|-------|----------|
| `Numero de telefono invalido` | Phone format wrong | Use `+[country][number]` format |
| `Demasiados intentos` | >3 SMS in 1 hour | Wait 1 hour or use different number |
| `Codigo invalido o expirado` | Wrong code or expired | Re-send SMS, use fresh code |
| `El telefono no ha sido verificado` | Skipped verification | Complete SMS verification first |
| `Twilio is not configured` | Missing env vars in prod | Set Twilio credentials |

---

## 📝 **Environment Variables**

```bash
# Required for Production
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_VERIFY_SERVICE_SID="VA..."

# Optional (Dev works without these)
# If not set, uses database fallback with code "123456"
```

---

## 🔍 **Debugging**

### Enable Detailed Logging
All endpoints now log with prefixes:
```
[sms/send]    - SMS sending operations
[sms/verify]  - Verification operations
[leads/POST]  - Lead creation
[leads/GET]   - Lead retrieval
```

### Check Verification Status
```typescript
// Database query
const verification = await prisma.smsVerification.findFirst({
  where: {
    phone: "+573001234567",
    verified: true,
    expiresAt: { gte: new Date() }
  },
  orderBy: { createdAt: "desc" }
});
```

### Monitor Twilio
```bash
# Twilio Console
# https://console.twilio.com/us1/monitor/logs/verify

# Look for:
# - Verification check approved
# - Verification sent
```

---

## 📊 **Key Metrics**

Track these in production:
- **SMS Send Rate**: Requests to `/api/sms/send`
- **Verification Success Rate**: Successful `/api/sms/verify` calls
- **Lead Creation Success Rate**: Successful `/api/leads` POST
- **Failed Verifications**: 403 errors on lead creation
- **Rate Limited Requests**: 429 responses

---

## 🚨 **Alert Thresholds**

Set up alerts for:
- ❌ Lead creation failures > 5% (phone verification issues)
- ❌ SMS send failures > 2% (Twilio problems)
- ⚠️ Verification attempts > 1000/hour (possible abuse)
- ⚠️ 429 rate limit errors > 50/hour (legitimate traffic or attack)

---

## ✅ **Success Checklist**

When everything works correctly, logs should show:
```
[sms/send] request received { phone: '+573001234567', twilioConfigured: true }
[sms/send] twilio path
[sms/send] response sent { ms: 234 }
  ↓
[User receives SMS and enters code]
  ↓
[sms/verify] request received { phone: '+573001234567', codeProvided: true }
[sms/verify] twilio path
[sms/verify] creating verification record
[sms/verify] response sent { ms: 456 }
  ↓
[Frontend submits lead]
  ↓
[leads/POST] Phone verified successfully { phone: '+573001234567' }
[leads/POST] Lead created { leadId: 'xyz', matchCount: 3 }
```

---

## 🎯 **Performance**

Expected response times:
- `/api/sms/send` (dev): ~50ms
- `/api/sms/send` (prod): ~300ms (Twilio API call)
- `/api/sms/verify` (dev): ~30ms (DB lookup)
- `/api/sms/verify` (prod): ~400ms (Twilio API + DB write)
- `/api/leads` POST: ~500ms (DB writes + matching algorithm)

---

## 📚 **Related Documentation**

- [TESTING_SMS_VERIFICATION.md](TESTING_SMS_VERIFICATION.md) - Full testing guide
- [PRIORITY_1_FIXES_SUMMARY.md](PRIORITY_1_FIXES_SUMMARY.md) - Changes made
- [Twilio Verify API Docs](https://www.twilio.com/docs/verify/api)
- [Prisma Docs](https://www.prisma.io/docs/)
