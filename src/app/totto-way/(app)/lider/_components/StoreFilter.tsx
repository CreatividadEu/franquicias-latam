"use client";

import { useRouter } from "next/navigation";

export function StoreFilter({
  stores,
  value,
  allLabel,
}: {
  stores: { id: string; name: string }[];
  value: string | null;
  allLabel: string;
}) {
  const router = useRouter();
  return (
    <select
      className="tw-select"
      value={value ?? ""}
      aria-label={allLabel}
      onChange={(event) => {
        const next = event.target.value;
        router.push(next ? `/totto-way/lider?tienda=${next}` : "/totto-way/lider");
      }}
    >
      <option value="">{allLabel}</option>
      {stores.map((store) => (
        <option key={store.id} value={store.id}>
          {store.name}
        </option>
      ))}
    </select>
  );
}
