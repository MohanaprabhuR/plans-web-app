"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const DashboardPage = () => {
  const router = useRouter();
  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };
  return (
    <div>
      <h1>Dashboard</h1>
      <Button variant="destructive" onClick={() => signOut()}>
        Sign Out
      </Button>
    </div>
  );
};

export default DashboardPage;
