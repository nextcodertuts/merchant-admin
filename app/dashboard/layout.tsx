import { redirect } from "next/navigation";
import SessionProvider from "./SessionProvider";
import { validateRequest } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  if (!session.user) redirect("/auth/login");

  return (
    <SessionProvider value={session}>
      <div className="flex h-screen bg-gray-100">
        <Sidebar user={session.user} />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </SessionProvider>
  );
}
