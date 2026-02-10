import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Skip auth check for login page
  const isLoginPage = pathname === "/admin/login" || pathname.startsWith("/admin/login");

  if (!isLoginPage) {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      redirect("/admin/login");
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "ADMIN") {
      redirect("/admin/login");
    }
  }

  // Login page gets simple wrapper, other pages get full admin layout
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
