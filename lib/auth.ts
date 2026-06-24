import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  session: { strategy: "jwt" as const },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Nom", type: "text" }
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        if (!email) return null;
        const user = await prisma.user.upsert({
          where: { email },
          update: { name: credentials?.name || undefined },
          create: { email, name: credentials?.name || "Consultant demo" }
        });
        return { id: user.id, email: user.email, name: user.name };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: { sub?: string }; user?: { id?: string } }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }: { session: { user?: { id?: string; email?: string | null; name?: string | null } }; token: { sub?: string } }) {
      if (session.user) session.user.id = token.sub ?? "";
      return session;
    }
  }
};

export async function requireUser() {
  const session = (await getServerSession(authOptions as never)) as { user?: { id?: string; email?: string | null } } | null;
  if (!session?.user?.id) throw new Error("AUTH_REQUIRED");
  return { id: session.user.id, email: session.user.email ?? "" };
}
