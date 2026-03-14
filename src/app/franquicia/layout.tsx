export default function FranchisiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ ["--font-heading" as string]: "var(--font-inter)" }}>
      {children}
    </div>
  );
}
