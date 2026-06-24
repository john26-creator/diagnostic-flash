import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = (await getServerSession(authOptions as never)) as { user?: { id?: string; email?: string | null } } | null;
  if (!session?.user?.id) redirect("/login");
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-gold/40 bg-white px-6 py-3">
        <Link href="/app" className="font-semibold text-night">Diagnostic Flash IA</Link>
        <div className="text-sm text-slatecopy">{session.user.email}</div>
      </header>
      {children}
    </div>
  );
}
