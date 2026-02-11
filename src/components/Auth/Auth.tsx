"use client";

import React, { useState } from "react";
import WelcomeScreen from "../common/welcome";
import SignupScreen from "./Signup";
import LoginScreen from "./Login";

type AuthView = "signup" | "login";

const AuthScreen = () => {
  const [view, setView] = useState<AuthView>("signup");

  return (
    <div className="flex h-screen">
      <div className="w-1/2">
        <WelcomeScreen />
      </div>
      <div className="w-1/2">
        <div className="p-5 flex items-center justify-center h-full">
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
