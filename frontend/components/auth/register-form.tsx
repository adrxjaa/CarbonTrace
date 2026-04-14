"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const { pushToast } = useToast();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (name.trim().length < 2) {
      setFormError("Enter your full name.");
      return;
    }

    if (!email.includes("@")) {
      setFormError("Use a valid email address.");
      return;
    }

    if (password.length < 8) {
      setFormError("Create a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setFormError("Mock registration completed locally. API integration is still pending.");
    pushToast({
      tone: "success",
      title: "Profile drafted",
      description: "Your registration UI is working with mock validation only.",
    });
  }

  return (
    <Card className="w-full max-w-lg p-7 sm:p-9">
      <div className="mb-8 space-y-3">
        <p className="text-xs uppercase tracking-[0.34em] text-forest">New Workspace</p>
        <h1 className="text-3xl font-semibold text-body">Create your account</h1>
        <p className="text-sm text-body/70">
          Set up a profile to track submissions, credits earned, and verification health.
        </p>
      </div>

      <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
        <div className="sm:col-span-2">
          <Input
            id="register-name"
            label="Full name"
            placeholder="Aarav Mehta"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            id="register-email"
            label="Email"
            type="email"
            placeholder="aarav@carbontrace.io"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <Input
          id="register-password"
          label="Password"
          type="password"
          placeholder="Minimum 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Input
          id="register-confirm-password"
          label="Confirm password"
          type="password"
          placeholder="Repeat password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />

        <div className="sm:col-span-2">
          {formError ? (
            <div className="rounded-2xl border border-[#efc2c2] bg-[#fff4f4] px-4 py-3 text-sm text-[#9b3d3d]">
              {formError}
            </div>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <Button type="submit" className="w-full" size="lg">
            Create Account
          </Button>
        </div>
      </form>

      <p className="mt-6 text-sm text-body/70">
        Already have an account? <Link href="/login" className="font-medium text-deep">Sign in</Link>
      </p>
    </Card>
  );
}
