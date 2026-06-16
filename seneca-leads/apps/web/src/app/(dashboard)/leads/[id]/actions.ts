'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { LeadStatusEnum } from '@seneca/shared';

export async function updateLeadStatus(
  leadId: string,
  rawStatus: string,
  notes: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = LeadStatusEnum.safeParse(rawStatus);
  if (!parsed.success) return { ok: false, error: 'Invalid status' };
  const updated = await prisma.salesLead.update({
    where: { id: leadId },
    data: {
      status: parsed.data,
      notes: notes.trim() || null,
      ...(parsed.data === 'contacted' || parsed.data === 'qualified' || parsed.data === 'won'
        ? { contactedAt: new Date() }
        : {}),
    },
  });
  revalidatePath(`/leads/${leadId}`);
  revalidatePath('/leads');
  void updated;
  return { ok: true };
}
