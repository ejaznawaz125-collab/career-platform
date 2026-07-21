"use client";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import SocialLogin from "./SocialLogin";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  setLoading(true);
  setError("");

  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  setLoading(false);

  if (result?.error) {
    setError("Invalid email or password");
    return;
  }

  router.push("/dashboard");
  router.refresh();
}
  return (
    <div className="w-full max-w-md">

      <h1 className="mb-2 text-4xl font-bold text-slate-900">
        Welcome Back
      </h1>

      <p className="mb-8 text-slate-600">
        Login to continue your career journey.
      </p>

      <form
  onSubmit={handleSubmit}
  className="space-y-5"
>

       <Input
  type="email"
  placeholder="Email Address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

<Input
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

        <div className="flex items-center justify-between text-sm">

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Remember me
          </label>

          <a
            href="/forgot-password"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Forgot Password?
          </a>

        </div>

        <Button
  text="Login"
  type="submit"
  loading={loading}
/>

      </form>

<SocialLogin />

      <p className="mt-8 text-center text-slate-600">
        Don't have an account?{" "}
        <a
          href="/register"
          className="font-semibold text-blue-600"
        >
          Register
        </a>
      </p>

    </div>
  );
}