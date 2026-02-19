"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

const DashboardPage = () => {
  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <Button variant="destructive" onClick={signOut} className="mt-4">
        Sign Out
      </Button>
    </div>
  );
};

export default DashboardPage;
