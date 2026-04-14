import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <section className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center py-10">
      <RegisterForm />
    </section>
  );
}
