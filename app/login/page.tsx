"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/form";

export default function LoginPage() {
  const [email, setEmail] = useState("consultant@example.com");
  const [name, setName] = useState("Consultant Demo");

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Diagnostic Flash IA</CardTitle>
          <p className="text-sm text-muted-foreground">Connexion locale MVP par email. Les donnees restent isolees par utilisateur.</p>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              await signIn("credentials", { email, name, callbackUrl: "/app" });
            }}
          >
            <Field label="Email">
              <input className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} />
            </Field>
            <Field label="Nom">
              <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} />
            </Field>
            <Button type="submit">Entrer</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
