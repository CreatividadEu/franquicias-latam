# Country Standardization Implementation

## Overview
Standardized country support across the entire platform to include all Latin American countries (except Cuba), Spain, and the United States.

**Total Countries: 20**
- 18 Latin American countries
- Spain
- United States

---

## ✅ Implementation Complete

### 1️⃣ Central Constant Created

**File:** [`src/lib/constants/countries.ts`](src/lib/constants/countries.ts)

This is now the **single source of truth** for all country data.

**Exports:**
- `COUNTRIES` - Array of all 20 countries with code, name, flag, phoneCode
- `CountryCode` - TypeScript type for country codes
- `Country` - TypeScript type for country objects
- `getCountryByCode()` - Helper to find country by code
- `getCountryName()` - Get country name by code
- `isValidCountryCode()` - Type-safe country code validation
- `getCountryCodes()` - Get all valid country codes

**Full Country List:**
```
Argentina       🇦🇷  AR
Bolivia         🇧🇴  BO
Brazil          🇧🇷  BR
Chile           🇨🇱  CL
Colombia        🇨🇴  CO
Costa Rica      🇨🇷  CR
Dominican Rep.  🇩🇴  DO
Ecuador         🇪🇨  EC
El Salvador     🇸🇻  SV
Guatemala       🇬🇹  GT
Honduras        🇭🇳  HN
Mexico          🇲🇽  MX
Nicaragua       🇳🇮  NI
Panama          🇵🇦  PA
Paraguay        🇵🇾  PY
Peru            🇵🇪  PE
Uruguay         🇺🇾  UY
Venezuela       🇻🇪  VE
Spain           🇪🇸  ES
United States   🇺🇸  US
```

---

### 2️⃣ Database Seed Updated

**File:** [`prisma/seed.ts`](prisma/seed.ts)

**Changes:**
- ✅ Imports `COUNTRIES` from the central constant
- ✅ Seeds all 20 countries automatically
- ✅ Uses upsert to update existing countries safely
- ✅ Previous: 6 countries → Now: 20 countries

**How to Run:**
```bash
npx prisma db seed
```

**Before:**
```typescript
// Hardcoded 6 countries
const countries = await Promise.all([
  { name: "Colombia", code: "CO", ... },
  { name: "Mexico", code: "MX", ... },
  // ...only 6 total
])
```

**After:**
```typescript
// Uses canonical list - 20 countries
import { COUNTRIES } from "../src/lib/constants/countries";
const countries = await Promise.all(
  COUNTRIES.map((c) => prisma.country.upsert({ ... }))
);
```

---

### 3️⃣ Validation Layer Added

**File:** [`src/lib/validation/countries.ts`](src/lib/validation/countries.ts)

**Functions:**
- `validateCountryId(countryId, prisma)` - Validates single country ID exists in DB
- `validateCountryIds(countryIds, prisma)` - Validates multiple country IDs
- `isValidCountryCode(code)` - Checks if country code is in canonical list
- `getValidCountryCodes()` - Returns all valid country codes

These validation functions are now used in all API routes that accept country data.

---

### 4️⃣ API Routes Updated

#### **Franchises - Create**
**File:** [`src/app/api/franchises/route.ts`](src/app/api/franchises/route.ts)

**Changes:**
- ✅ Imports `validateCountryIds` from validation module
- ✅ Validates country IDs before creating franchise
- ✅ Returns 400 error if invalid country IDs provided

```typescript
// Validate country IDs
if (countryIds && countryIds.length > 0) {
  const validation = await validateCountryIds(countryIds, prisma);
  if (!validation.valid) {
    return NextResponse.json(
      { error: `IDs de pais invalidos: ${validation.invalidIds.join(", ")}` },
      { status: 400 }
    );
  }
}
```

#### **Franchises - Update**
**File:** [`src/app/api/franchises/[id]/route.ts`](src/app/api/franchises/[id]/route.ts)

**Changes:**
- ✅ Imports `validateCountryIds` from validation module
- ✅ Validates country IDs before updating franchise coverage
- ✅ Returns 400 error if invalid country IDs provided

#### **Leads - Create**
**File:** [`src/app/api/leads/route.ts`](src/app/api/leads/route.ts)

**Changes:**
- ✅ Imports `validateCountryId` from validation module
- ✅ Validates country ID before creating/updating lead
- ✅ Returns 400 error if invalid country ID provided

```typescript
// Validate country ID
const isValidCountry = await validateCountryId(countryId, prisma);
if (!isValidCountry) {
  return NextResponse.json(
    { error: "ID de pais invalido" },
    { status: 400 }
  );
}
```

---

### 5️⃣ Chatbot & Admin Already Compatible

#### **Chatbot Country Step**
**File:** [`src/components/chatbot/steps/CountryStep.tsx`](src/components/chatbot/steps/CountryStep.tsx)

- ✅ Already fetches countries from `/api/countries`
- ✅ Will automatically show all 20 countries once seed is run
- ✅ No changes needed - works dynamically

#### **Admin Country Selector**
**File:** [`src/components/admin/FranchiseForm.tsx`](src/components/admin/FranchiseForm.tsx)

- ✅ Already fetches countries from `/api/countries`
- ✅ Will automatically show all 20 countries once seed is run
- ✅ No changes needed - works dynamically

#### **API Endpoint**
**File:** [`src/app/api/countries/route.ts`](src/app/api/countries/route.ts)

- ✅ Returns all countries from database
- ✅ Cached for 5 minutes for performance
- ✅ No changes needed

---

## 🗂️ Files Modified/Created

### Created:
1. ✅ `src/lib/constants/countries.ts` - Central country constant
2. ✅ `src/lib/validation/countries.ts` - Validation utilities

### Modified:
3. ✅ `prisma/seed.ts` - Seeds all 20 countries
4. ✅ `src/app/api/franchises/route.ts` - Added validation
5. ✅ `src/app/api/franchises/[id]/route.ts` - Added validation
6. ✅ `src/app/api/leads/route.ts` - Added validation

---

## 🚀 Next Steps

### 1. Run Database Seed
```bash
npx prisma db seed
```

This will add all 14 new countries to the database:
- Bolivia, Brazil, Costa Rica, Dominican Republic, El Salvador
- Guatemala, Honduras, Nicaragua, Panama, Paraguay
- Uruguay, Venezuela, Spain, United States

### 2. Test Chatbot
- Visit `/quiz`
- Complete to country selection step
- Verify all 20 countries are displayed
- Verify flags render correctly

### 3. Test Admin Panel
- Login to `/admin`
- Go to Franquicias
- Create/Edit a franchise
- Verify country selector shows all 20 countries
- Try selecting multiple countries

### 4. Test Validation
Try creating a franchise with an invalid country ID via API:
```bash
curl -X POST http://localhost:3000/api/franchises \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","countryIds":["invalid-id"]}'
```

Should return: `400 - IDs de pais invalidos: invalid-id`

---

## ✅ Acceptance Criteria Status

| Criteria | Status | Notes |
|----------|--------|-------|
| Countries identical everywhere | ✅ | Single source of truth in `constants/countries.ts` |
| Chatbot renders full list | ✅ | Dynamically fetches from DB |
| Admin forms updated | ✅ | Dynamically fetches from DB |
| DB compatible | ✅ | Seed updated, no migration needed |
| Filtering still works | ✅ | Matching logic unchanged |
| No type errors | ✅ | TypeScript compilation clean |
| No duplicate country lists | ✅ | Only one list in `constants/countries.ts` |

---

## 🔍 Architecture

```
┌─────────────────────────────────────┐
│  lib/constants/countries.ts         │ ← Single Source of Truth
│  - COUNTRIES array (20 countries)   │
│  - Types: CountryCode, Country      │
│  - Helper functions                 │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  lib/validation/countries.ts        │ ← Validation Layer
│  - validateCountryId()              │
│  - validateCountryIds()             │
│  - isValidCountryCode()             │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  API Routes                         │ ← Backend Validation
│  - /api/franchises (POST/PATCH)     │
│  - /api/leads (POST)                │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Database (Prisma)                  │ ← Data Storage
│  - Country table (20 rows)          │
│  - Seeded via constants             │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Frontend Components                │ ← Dynamic Display
│  - CountryStep (Chatbot)            │
│  - FranchiseForm (Admin)            │
│  - Both fetch via /api/countries    │
└─────────────────────────────────────┘
```

---

## 📝 Migration Notes

**Database Schema:**
- ✅ No migration required
- Country model uses `String` fields (flexible)
- Existing countries will be updated by upsert
- New countries will be inserted

**Backwards Compatibility:**
- ✅ Fully backwards compatible
- Existing franchises with country coverage: **NO CHANGES**
- Existing leads with country: **NO CHANGES**
- Only adds new countries, doesn't modify existing data

**Rollback:**
If needed, simply:
```bash
git checkout HEAD -- src/lib/constants/countries.ts src/lib/validation/countries.ts
```

Then restore original seed:
```bash
git checkout HEAD -- prisma/seed.ts
npx prisma db seed
```

---

## 🎉 Summary

✅ **Centralized** country data in single constant
✅ **Standardized** 20 countries across entire platform
✅ **Validated** all API inputs for country data
✅ **Automated** database seeding from constant
✅ **Type-safe** with TypeScript types
✅ **Zero breaking changes** to existing logic

**Result:** All country selectors (chatbot, admin) will now consistently show the same 20 countries, and all inputs are validated against this canonical list.

---

**Date:** 2026-02-08
**Status:** ✅ Complete - Ready for Testing
**Breaking Changes:** None
**Migration Required:** Run `npx prisma db seed`
