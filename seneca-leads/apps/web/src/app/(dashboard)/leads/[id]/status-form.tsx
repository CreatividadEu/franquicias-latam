'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { updateLeadStatus } from './actions';

const STATUSES = ['new', 'qualified', 'contacted', 'won', 'lost'] as const;

export function StatusForm({
  leadId,
  initialStatus,
  initialNotes,
  contactedAt,
}: {
  leadId: string;
  initialStatus: string;
  initialNotes: string | null;
  contactedAt: Date | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  function handleSave() {
    startTransition(async () => {
      const res = await updateLeadStatus(leadId, status, notes);
      if (res.ok) setSavedAt(new Date());
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-xs text-foreground-muted uppercase tracking-wide w-16">Status</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {contactedAt && (
          <span className="text-xs text-foreground-subtle">
            Last contacted {contactedAt.toISOString().slice(0, 10)}
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-foreground-muted uppercase tracking-wide">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Sales rep notes after each touchpoint…"
          className="w-full rounded-md border border-border bg-background-elevated px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isPending} size="md">
          {isPending ? 'Saving…' : 'Save'}
        </Button>
        {savedAt && (
          <Badge variant="success">Saved {savedAt.toLocaleTimeString()}</Badge>
        )}
      </div>
    </div>
  );
}
