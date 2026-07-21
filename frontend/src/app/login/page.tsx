import AuthLayout from "@/components/auth/AuthLayout";
import AuthBanner from "@/components/auth/AuthBanner";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout
      banner={<AuthBanner />}
    >
      <LoginForm />
    </AuthLayout>
  );
}