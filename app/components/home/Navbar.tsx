"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "react-toastify";

import { authClient, useSession } from "@/lib/auth-client";
import {
  USER_ROLES,
  isUserRole,
  type UserRole,
} from "@/lib/config/user-roles";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

// These routes can be adjusted to match your actual page structure.
const ROLE_DASHBOARDS: Record<UserRole, string> = {
  customer: "/dashboard/customer",
  technician: "/dashboard/technician",
  admin: "/dashboard/admin",
};

const PROFILE_HREF = "/dashboard/profile";
const CUSTOMER_REPAIRS_HREF = "/dashboard/customer/repairs";



const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const { data: session, isPending, refetch } = useSession();

  const { resolvedTheme, setTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid rendering the theme-dependent icon before hydration.
  // useEffect(() => {
  //   // setMounted(true);
  // }, []);

  // Better Auth user information.
  const userName = session?.user.name;
  const userEmail = session?.user.email;
  const userRole = session?.user.role;
  const userImage = session?.user.image;

  const roleLabel = isUserRole(userRole)
    ? USER_ROLES[userRole].label
    : "Member";

  const dashboardHref = isUserRole(userRole)
    ? ROLE_DASHBOARDS[userRole]
    : "/dashboard";

  const dashboardLabel = `${roleLabel} Dashboard`;

  const userInitials =
    userName
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  const handleLogout = async () => {
    try {
      const { error } = await authClient.signOut();

      if (error) {
        toast.error(error.message || "Unable to log out.");
        return;
      }

      await refetch();

      toast.success("Logged out successfully!");

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Something went wrong while logging out.");
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const getNavLinkClass = (href: string) => {
    const isActive = pathname === href;

    return [
      "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
      isActive
        ? "bg-[var(--fm-primary)] text-white"
        : "text-foreground hover:bg-muted",
    ].join(" ");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="FixMate Home"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--fm-primary)] text-white">
            <Wrench className="size-5" />
          </span>

          <span className="text-xl font-bold tracking-tight text-[var(--fm-primary)]">
            FixMate
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={getNavLinkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right-side actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Theme toggle */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="rounded-full"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Moon className="size-5" />
            ) : (
              <Sun className="size-5" />
            )}
          </Button>

          {/* Session loading state */}
          {isPending ? (
  <div className="h-14 w-32 animate-pulse rounded-2xl bg-muted" />
) : session ? (
  <DropdownMenu>
    {/* User capsule */}
   <DropdownMenuTrigger
  render={
    <Button
      type="button"
      variant="ghost"
      className="
        flex h-12
        w-full max-w-[260px] sm:max-w-[280px]
        items-center justify-start gap-2 sm:gap-2.5
        rounded-xl border border-border
        bg-background px-2.5 sm:px-3
        shadow-sm hover:bg-muted
      "
    />
  }
>
  <Avatar className="size-8 shrink-0">
    <AvatarImage
      src={userImage || undefined}
      alt={userName || "User"}
    />
    <AvatarFallback className="bg-[var(--fm-primary)] text-xs text-white">
      {userInitials}
    </AvatarFallback>
  </Avatar>

  <span className="min-w-0 flex-1 truncate text-left text-sm sm:text-[15px] font-semibold text-foreground">
    {userName || "User"}
  </span>

  <Badge
    className="shrink-0 rounded-full border-0 px-2 sm:px-3 py-0.5 text-[10px] sm:text-xs font-semibold"
    style={{
      backgroundColor:
        "color-mix(in srgb, var(--fm-secondary) 12%, transparent)",
      color: "var(--fm-secondary)",
    }}
  >
    {roleLabel}
  </Badge>

  <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
</DropdownMenuTrigger>

    {/* Dropdown panel */}
    <DropdownMenuContent
      align="end"
      sideOffset={10}
      className="z-[100] w-[min(280px,calc(90vw-2rem))] 
      rounded-2xl border border-border bg-background p-3 shadow-xl"
      
    >
      {/* User information */}
      <DropdownMenuGroup>
        <DropdownMenuLabel className="px-3 py-3 font-normal">
          <p className="text-base font-medium text-muted-foreground">
            Signed in as
          </p>

          <p className="mt-1 break-all text-sm font-bold text-foreground">
            {userEmail}
          </p>
        </DropdownMenuLabel>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      {/* Dashboard */}
      <DropdownMenuItem
        onClick={() => router.push(dashboardHref)}
        className="flex cursor-pointer items-center gap-4 rounded-lg px-3 py-3 text-base font-semibold"
      >
        <LayoutDashboard className="size-5 text-[var(--fm-primary)]" />
        {dashboardLabel}
      </DropdownMenuItem>

      {/* Update profile */}
      <DropdownMenuItem
        onClick={() => router.push(PROFILE_HREF)}
        className="flex cursor-pointer items-center gap-4 rounded-lg px-3 py-3 text-base font-semibold"
      >
        <UserRound className="size-5" />
        Update Profile
      </DropdownMenuItem>

      {/* Customer-specific option */}
      {userRole === "customer" && (
        <DropdownMenuItem
          onClick={() => router.push(CUSTOMER_REPAIRS_HREF)}
          className="flex cursor-pointer items-center gap-4 rounded-lg px-3 py-3 text-base font-semibold"
        >
          <Wrench className="size-5" />
          My Repairs 
        </DropdownMenuItem>
      )}

      <DropdownMenuSeparator />

      {/* Logout */}
      <DropdownMenuItem
        onClick={() => void handleLogout()}
        className="cursor-pointer rounded-lg px-3 py-3 text-base font-semibold text-red-600 focus:bg-red-50 focus:text-red-600"
      >
        <LogOut className="mr-2 size-5" />
        Sign Out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
) : (
            /* Guest actions */
            <div className="hidden items-center gap-3 sm:flex">
              <Button variant="ghost" >
                <Link href="/signin">Sign In</Link>
              </Button>

              <Button
                
                className="rounded-xl bg-[var(--fm-primary)] px-5 font-semibold text-white hover:bg-[var(--fm-primary-hover)]"
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile navigation trigger */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen((previous) => !previous)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 shadow-lg md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className={getNavLinkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {!isPending && !session && (
            <div className="mt-4 flex gap-3 border-t border-border pt-4">
              <Button variant="outline"  className="flex-1">
                <Link href="/sign-in" onClick={closeMobileMenu}>
                  Sign In
                </Link>
              </Button>

              <Button
                
                className="flex-1 bg-[var(--fm-primary)] text-white hover:bg-[var(--fm-primary-hover)]"
              >
                <Link href="/signup" onClick={closeMobileMenu}>
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}