import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, investmentRange, city, experience, franchiseSlug } =
      body as {
        name: string;
        email: string;
        phone: string;
        investmentRange: string;
        city?: string;
        experience?: string;
        franchiseSlug: string;
      };

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !franchiseSlug?.trim()) {
      return NextResponse.json(
        { error: "Nombre, email, teléfono y franquicia son requeridos" },
        { status: 400 },
      );
    }

    const formLead = await prisma.formLead.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        investmentRange: investmentRange?.trim() || "",
        city: city?.trim() || null,
        experience: experience?.trim() || null,
        franchiseSlug: franchiseSlug.trim(),
        landingSource: "landing-form",
      },
    });

    console.log("[form-leads/POST] Created form lead", {
      id: formLead.id,
      franchiseSlug,
    });

    return NextResponse.json({ id: formLead.id }, { status: 201 });
  } catch (error) {
    console.error("[form-leads/POST] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
