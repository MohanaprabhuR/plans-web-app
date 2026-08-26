"use client";

import React, { useState } from "react";
import WelcomeScreen from "../BaseComponents/common/welcome";
import SignupScreen from "./Signup";
import LoginScreen from "./Login";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type AuthView = "signup" | "login";

const AuthScreen = () => {
  const [view, setView] = useState<AuthView>("signup");

  return (
    <div className="relative flex h-screen">
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="hidden w-1/2 md:block">
        <WelcomeScreen />
      </div>
      <div className="w-full md:w-1/2">
        <div className="flex h-full items-center justify-center bg-background p-5">
          {view === "signup" ? (
            <SignupScreen onSwitchToLogin={() => setView("login")} />
          ) : (
            <LoginScreen onSwitchToSignup={() => setView("signup")} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
