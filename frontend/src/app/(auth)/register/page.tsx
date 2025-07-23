// src/app/(auth)/register/page.tsx
import RegisterForm from "../../components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-8">Create an Account</h1>
      <RegisterForm />
    </div>
  );
}