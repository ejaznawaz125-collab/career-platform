import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Link from "next/link";

export default function ResetPasswordForm() {
  return (
    <div className="w-full max-w-md">

      <h1 className="mb-2 text-4xl font-bold text-slate-900">
        Reset Password
      </h1>

      <p className="mb-8 text-slate-600">
        Choose a new secure password.
      </p>

      <div className="space-y-5">

        <Input
          type="password"
          placeholder="New Password"
        />

        <Input
          type="password"
          placeholder="Confirm Password"
        />

        <Button text="Reset Password" />

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