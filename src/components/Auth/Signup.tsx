"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { supabase } from "@/lib/supabase/client";
import { isValidEmail } from "@/lib/utils";
import { toast } from "sonner";
import { Alert, AlertTitle } from "../ui/alert";
import { CircleAlert } from "lucide-react";

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="size-5"
    fill="none"
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

type SignupScreenProps = {
  onSwitchToLogin?: () => void;
};

export default function SignupScreen({ onSwitchToLogin }: SignupScreenProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast.custom(() => (
        <Alert variant="error">
          <CircleAlert className="size-4" />
          <AlertTitle>Please agree to the Terms and Privacy Policy.</AlertTitle>
        </Alert>
      ));
      return;
    }

    if (!isValidEmail(email)) {
      toast.custom(() => (
        <Alert variant="error">
          <CircleAlert className="size-4" />
          <AlertTitle>Enter a valid email address.</AlertTitle>
        </Alert>
      ));
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) {
      toast.custom(() => (
        <Alert variant="error">
          <CircleAlert className="size-4" />
          <AlertTitle>{error.message}</AlertTitle>
        </Alert>
      ));
      return;
    }
    if (data?.user && !data.user.identities?.length) {
      toast.custom(() => (
        <Alert variant="error">
          <CircleAlert className="size-4" />
          <AlertTitle>An account with this email already exists.</AlertTitle>
        </Alert>
      ));
      return;
    }
    const displayName = data?.user?.user_metadata?.full_name ?? fullName;
    toast.custom(() => (
      <Alert variant="success">
        <CircleAlert className="size-4" />
        <AlertTitle>Account created. Welcome, {displayName}!</AlertTitle>
      </Alert>
    ));
    // If the new user somehow already has onboarding_complete, go to dashboard; otherwise onboarding.
    const { data: sessionData } = await supabase.auth.getSession();
    const onboardingComplete =
      sessionData.session?.user.user_metadata?.onboarding_complete === true;

    router.push(onboardingComplete ? "/dashbaord" : "/onboarding");
  };

  return (
    <div className="flex w-full max-w-100 flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold  text-foreground tracking-4 leading-6">
          Create Your Account
        </h1>
        <p className="text-sm text-muted-foreground tracking-4 leading-6">
          Enter your details to access your account.
        </p>
      </div>

      <Button variant="outline" size="lg" className="w-full bg-background">
        <GoogleIcon />
        Continue with Google
      </Button>

      <div className="relative flex items-center gap-3">
        <span className="flex-1 border-t border-border" />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Or
        </span>
        <span className="flex-1 border-t border-border" />
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSignUp}>
        <FieldGroup className="gap-5">
          <Field>
            <FieldLabel>Full Name</FieldLabel>
            <Input
              id="signup-fullname"
              type="text"
              placeholder="Enter Name"
              variant="outline"
              size="lg"
              prefix={<User className="size-4 shrink-0" />}
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel>Email Address</FieldLabel>
            <Input
              id="signup-email"
              type="email"
              placeholder="Enter Email"
              variant="outline"
              size="lg"
              prefix={<Mail className="size-4 shrink-0" />}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input
              id="signup-password"
              type="password"
              placeholder="Enter Password"
              variant="outline"
              size="lg"
              prefix={<Lock className="size-4 shrink-0" />}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </Field>
        </FieldGroup>

        <Checkbox
          id="signup-terms"
          label="I agree to the Terms and Privacy Policy"
          size="sm"
          checked={agreeTerms}
          onCheckedChange={(checked) => setAgreeTerms(checked === true)}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Creating account…" : "Create Account"}
        </Button>
        <Label className="text-center">
          Already have an account?
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="underline cursor-pointer font-medium text-foreground hover:text-primary"
          >
            Login
          </button>
        </Label>
      </form>
    </div>
  );
}
