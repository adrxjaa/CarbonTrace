import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <section className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center py-10">
      <LoginForm />
    </section>
  );
}
