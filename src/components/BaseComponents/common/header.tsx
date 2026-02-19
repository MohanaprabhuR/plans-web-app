"use client";
import { Header } from "@/components/ui/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import client from "@/api/client";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import Logo from "../../../../public/images/svg/plans-logo.svg";
import Notification from "../../../../public/images/svg/notification.svg";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { User, LogOut, ChevronDown, CircleAlert } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";

const HeaderLayout = () => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    await client.auth.signOut();
    toast.custom(() => (
      <Alert variant="success">
        <CircleAlert className="size-4" />
        <AlertTitle>Signed out successfully</AlertTitle>
      </Alert>
    ));

    router.push("/");
  };
  return (
    <>
      <Header className="shadow-[0_1px_0_0_rgba(255,94,0,0.1)] bg-[#FFF7ED] border-0 relative z-10 px-4">
        <div className="w-full mx-auto max-w-[1142px] px-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Image src={Logo} alt="logo" width={100} height={100} />
          </Link>
          <div className="flex items-center gap-x-8">
            <Link
              href="/dashboard"
              className={`font-medium text-base leading-6 tracking-none hover:text-orange-500 transition-all duration-300 delay-100 ${
                isActive("/dashboard")
                  ? "text-orange-500"
                  : "text-light-gray-800"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/policies"
              className={`font-medium text-base leading-6 tracking-none hover:text-orange-500 transition-all duration-300 delay-100 ${
                isActive("/policies")
                  ? "text-orange-500"
                  : "text-light-gray-800"
              }`}
            >
              Your Policies
            </Link>
            <Link
              href="/"
              className=" hover:text-orange-500 transition-all duration-300 delay-100 font-medium text-base leading-6 tracking-none text-light-gray-800"
            >
              Coverage
            </Link>
            <Link
              href="/"
              className=" hover:text-orange-500 transition-all duration-300 delay-100 font-medium text-base leading-6 tracking-none text-light-gray-800"
            >
              Search
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Image src={Notification} alt="logo" width={32} height={32} />
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2">
                <Avatar size="xl">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.user_metadata?.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-x-1">
                  <p className="font-medium text-base leading-6 tracking-none text-light-gray-800">
                    {user?.user_metadata?.full_name}
                  </p>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <User className="w-6 h-6" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-6 h-6" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Header>
    </>
  );
};

export default HeaderLayout;
