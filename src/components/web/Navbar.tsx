"use client";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import { ModeToggle } from "./ModeToggle";
import { useConvexAuth } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import SearchInput from "./SearchInput";

function Navbar() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  return (
    <nav className=" w-full flex justify-between items-center py-4 px-6">
      <div className=" flex items-center gap-10">
        <div className="text-4xl font-bold tracking-wider">
          <h1>
            M<span className="text-blue-800 ">L</span>
          </h1>
        </div>
        <div className=" text-2xl flex gap-2">
          <Link
            className={buttonVariants({
              variant: "ghost",
            })}
            href="/"
          >
            <span className="text-lg">Home</span>
          </Link>
          <Link
            className={buttonVariants({
              variant: "ghost",
            })}
            href="/blog"
          >
            <span className="text-lg">Blog</span>
          </Link>
          <Link
            className={buttonVariants({
              variant: "ghost",
            })}
            href="/create"
          >
            <span className="text-lg">Create</span>
          </Link>
        </div>
      </div>
      <div className="flex gap-4 items-center ">
        <SearchInput />
        {isLoading ? null : isAuthenticated ? (
          <Button
            onClick={() =>
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    toast.success("Logged out successfully");
                    router.push("/");
                  },
                  onError: (error) => {
                    toast.error(error.error.message);
                  },
                },
              })
            }
          >
            Logout
          </Button>
        ) : (
          <>
            <Link
              className={buttonVariants({ variant: "default" })}
              href="/auth/login"
            >
              Login
            </Link>
            <Link
              className={buttonVariants({
                variant: "outline",
              })}
              href="/auth/sign-up"
            >
              Register
            </Link>
          </>
        )}

        <ModeToggle />
      </div>
    </nav>
  );
}

export default Navbar;
