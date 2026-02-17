import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findMatches } from "@/lib/matching";
import { sendLeadNotification } from "@/lib/resend";
import { getAdminUser } from "@/lib/auth";
import type { InvestmentRange, ExperienceLevel } from "@prisma/client";
import { validateCountryId } from "@/lib/validation/countries";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      sectors,
      investmentRange,
      countryId,
      experienceLevel,
    } = body as {
      name: string;
      email: string;
      phone: string;
      sectors: string[];
      investmentRange: InvestmentRange;
      countryId: string;
      experienceLevel: ExperienceLevel;
    };

    const normalizedPhone = phone?.trim();

    if (
      !name ||
      !email ||
      !normalizedPhone ||
      !sectors?.length ||
      !investmentRange ||
      !countryId ||
      !experienceLevel
    ) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Validate country ID
    const isValidCountry = await validateCountryId(countryId, prisma);
    if (!isValidCountry) {
      return NextResponse.json(
        { error: "ID de pais invalido" },
        { status: 400 }
      );
    }

    // Check if phone has been verified
    const hasVerifiedSms = !!(await prisma.smsVerification.findFirst({
      where: {
        phone: normalizedPhone,
        verified: true,
        expiresAt: { gte: new Date() }, // Ensure verification hasn't expired
      },
      orderBy: { createdAt: "desc" }, // Get most recent verification
    }));

    if (!hasVerifiedSms) {
      console.error("[leads/POST] Phone verification failed", {
        phone: normalizedPhone,
      });
      return NextResponse.json(
        {
          error:
            "El telefono no ha sido verificado. Por favor completa la verificacion SMS.",
        },
        { status: 403 }
      );
    }

    console.log("[leads/POST] Phone verified successfully", {
      phone: normalizedPhone,
    });

    // Check for existing lead with same email or phone (deduplication)
    const existingLead = await prisma.lead.findFirst({
      where: {
        OR: [{ email }, { phone: normalizedPhone }],
      },
      include: {
        country: true,
        sectors: true,
      },
    });

    let lead;
    let isUpdate = false;

    if (existingLead) {
      console.log("[leads/POST] Duplicate detected, updating existing lead", {
        existingLeadId: existingLead.id,
        matchedBy: existingLead.email === email ? "email" : "phone",
      });

      // Update existing lead with new preferences
      // First, disconnect old sectors
      await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          sectors: { set: [] },
        },
      });

      // Then update with new data
      lead = await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          name,
          email,
          phone: normalizedPhone,
          phoneVerified: hasVerifiedSms,
          countryId,
          investmentRange,
          experienceLevel,
          sectors: { connect: sectors.map((id: string) => ({ id })) },
          viewed: false, // Reset viewed status for updated lead
        },
        include: {
          country: true,
          sectors: true,
        },
      });

      // Delete old match records
      await prisma.leadFranchiseMatch.deleteMany({
        where: { leadId: existingLead.id },
      });

      isUpdate = true;
    } else {
      console.log("[leads/POST] Creating new lead", {
        email,
        phone: normalizedPhone,
      });

      // Create new lead
      lead = await prisma.lead.create({
        data: {
          name,
          email,
          phone: normalizedPhone,
          phoneVerified: hasVerifiedSms,
          countryId,
          investmentRange,
          experienceLevel,
          sectors: { connect: sectors.map((id: string) => ({ id })) },
        },
        include: {
          country: true,
          sectors: true,
        },
      });
    }

    // Run matching algorithm
    const matches = await findMatches({
      sectors,
      investmentRange,
      countryId,
      experienceLevel,
    });

    // Save match records
    if (matches.length > 0) {
      await prisma.leadFranchiseMatch.createMany({
        data: matches.map((m) => ({
          leadId: lead.id,
          franchiseId: m.id,
          score: m.score,
        })),
      });
    }

    // Send email notification (async, don't block response)
    const investmentLabels: Record<string, string> = {
      RANGE_50K_100K: "$50k - $100k",
      RANGE_100K_200K: "$100k - $200k",
      RANGE_200K_PLUS: "$200k+",
    };

    sendLeadNotification({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      country: lead.country.name,
      investmentRange: investmentLabels[investmentRange] || investmentRange,
      matchCount: matches.length,
    }).catch(console.error);

    console.log("[leads/POST] Lead processed successfully", {
      leadId: lead.id,
      isUpdate,
      matchCount: matches.length,
    });

    return NextResponse.json({
      leadId: lead.id,
      matches,
      updated: isUpdate,
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      console.warn("[leads/GET] Unauthorized access attempt");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          country: true,
          sectors: true,
          matches: {
            include: { franchise: { include: { sector: true } } },
            orderBy: { score: "desc" },
          },
        },
      }),
      prisma.lead.count(),
    ]);

    console.log("[leads/GET] Retrieved leads", {
      page,
      limit,
      total,
      retrieved: leads.length,
    });

    return NextResponse.json({ leads, total, page, limit });
  } catch (error) {
    console.error("[leads/GET] Error fetching leads:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
