import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Link from "next/link";

export default function ForgotPasswordForm() {
  return (
    <div className="w-full max-w-md">

      <h1 className="mb-2 text-4xl font-bold text-slate-900">
        Forgot Password
      </h1>

      <p className="mb-8 text-slate-600">
        Enter your email to receive a reset link.
      </p>

      <Input
        type="email"
        placeholder="Email Address"
      />

      <div className="mt-6">
        <Button text="Send Reset Link" />
      </div>

      <p className="mt-8 text-center">
        <Link
          href="/login"
          className="text-blue-600 font-semibold"
        >
          Back to Login
        </Link>
      </p>

    </div>
  );
}