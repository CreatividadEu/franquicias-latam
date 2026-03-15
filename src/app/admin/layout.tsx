import { headers } from "next/headers";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  // Middleware sets x-pathname and guards all /admin routes except login.
  // The layout only needs to decide whether to wrap with the sidebar.
  const isLoginPage =
    pathname === "/admin/login" || pathname.startsWith("/admin/login/");

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-4 pt-[68px] md:pt-8 md:p-8">{children}</main>
    </div>
  );
}
