"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const { pushToast } = useToast();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.includes("@")) {
      setFormError("Use a valid email address to continue.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    setFormError("Mock authentication failed: backend API is not connected yet.");
    pushToast({
      tone: "error",
      title: "Login unavailable",
      description: "This screen is wired for UI only, with no live API yet.",
    });
  }

  return (
    <Card className="w-full max-w-md p-7 sm:p-9">
      <div className="mb-8 space-y-3">
        <p className="text-xs uppercase tracking-[0.34em] text-forest">Secure Access</p>
        <h1 className="text-3xl font-semibold text-body">Welcome back</h1>
        <p className="text-sm text-body/70">
          Review your carbon activity, credit balance, and recent verification status.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          id="login-email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          id="login-password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {formError ? (
          <div className="rounded-2xl border border-[#efc2c2] bg-[#fff4f4] px-4 py-3 text-sm text-[#9b3d3d]">
            {formError}
          </div>
        ) : null}

        <Button type="submit" className="w-full" size="lg">
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-sm text-body/70">
        No account yet? <Link href="/register" className="font-medium text-deep">Create one</Link>
      </p>
    </Card>
  );
}
