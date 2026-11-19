"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "react-toastify";

import {
  ArrowLeft,
  ArrowLeftRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Receipt,
  Settings,
  ShieldCheck,
  Sun,
  UserRound,
  UserRoundPen,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";

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
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type DashboardLayoutProps = {
  children: ReactNode;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type BreadcrumbItem = {
  label: string;
  href?: string;
};

// -----------------------------------------------------------------------------
// Dashboard navigation
// -----------------------------------------------------------------------------

const ROLE_NAVIGATION: Record<UserRole, NavigationItem[]> = {
  customer: [
    {
      label: "Customer Dashboard",
      href: "/dashboard/customer",
      icon: LayoutDashboard,
    },
    {
      label: "My Bookings",
      href: "/dashboard/customer/bookings",
      icon: CalendarDays,
    },
    {
      label: "Payment History",
      href: "/dashboard/customer/payment-history",
      icon: Receipt,
    },
  ],

  technician: [
    {
      label: "Technician Dashboard",
      href: "/dashboard/technician",
      icon: LayoutDashboard,
    },
    {
      label: "Add a Service",
      href: "/dashboard/technician/add-service",
      icon: PlusCircle,
    },
    {
      label: "My Services",
      href: "/dashboard/technician/services",
      icon: Wrench,
    },
    {
      label: "Manage Requests",
      href: "/dashboard/technician/requests",
      icon: ClipboardList,
    },
  ],

  admin: [
    {
      label: "Admin Dashboard",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Manage Users",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      label: "Service Approval",
      href: "/dashboard/admin/service-approval",
      icon: CheckCircle2,
    },
    {
      label: "All Bookings",
      href: "/dashboard/admin/bookings",
      icon: CalendarDays,
    },
    {
      label: "Transactions",
      href: "/dashboard/admin/transactions",
      icon: ArrowLeftRight,
    },
  ],
};

const SHARED_NAVIGATION: NavigationItem[] = [
  {
    label: "Update Profile",
    href: "/dashboard/profile",
    icon: UserRoundPen,
  },
];

const ROLE_DASHBOARD_PATHS: Record<UserRole, string> = {
  customer: "/dashboard/customer",
  technician: "/dashboard/technician",
  admin: "/dashboard/admin",
};

// -----------------------------------------------------------------------------
// Helper functions
// -----------------------------------------------------------------------------

function getInitials(name?: string | null) {
  if (!name?.trim()) return "U";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getActiveNavigationItem(
  pathname: string,
  navigationItems: NavigationItem[],
) {
  return navigationItems
    .filter(
      (item) =>
        pathname === item.href ||
        pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];
}

// -----------------------------------------------------------------------------
// Dashboard sidebar
// -----------------------------------------------------------------------------

type DashboardSidebarProps = {
  userRole: UserRole | null;
  userName?: string | null;
  userImage?: string | null;
  roleLabel: string;
  pathname: string;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onNavigate: (href: string) => void;
};

function DashboardSidebar({
  userRole,
  userName,
  userImage,
  roleLabel,
  pathname,
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
  onNavigate,
}: DashboardSidebarProps) {
  const navigationItems = userRole ? ROLE_NAVIGATION[userRole] : [];

  const dashboardHref = userRole
    ? ROLE_DASHBOARD_PATHS[userRole]
    : "/dashboard";

  const activeItem = getActiveNavigationItem(
    pathname,
    navigationItems,
  );

  const isDashboardActive =
    pathname === dashboardHref || pathname === "/dashboard";

  const initials = getInitials(userName);

  const workspaceLabel = userRole
    ? `${roleLabel.toUpperCase()} WORKSPACE`
    : "WORKSPACE";

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-dvh shrink-0 flex-col
          border-r border-sidebar-border
          bg-sidebar text-sidebar-foreground
          transition-[width,transform] duration-200 ease-in-out
          md:sticky md:top-0 md:z-30 md:translate-x-0
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-[260px] md:w-[76px]" : "w-[260px]"}
        `}
      >
        {/* Sidebar brand header */}
        <div
          className={`
            flex h-[72px] shrink-0 items-center
            border-b border-sidebar-border px-4
            ${isCollapsed ? "md:justify-center md:px-2" : "gap-3"}
          `}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wrench className="size-5" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold leading-tight text-sidebar-foreground">
                FixMate
              </p>
              <p className="text-xs text-muted-foreground">
                Service Hub
              </p>
            </div>
          )}

          {/* Desktop collapse button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="hidden size-8 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent md:inline-flex"
            aria-label={
              isCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>

          {/* Mobile close button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCloseMobile}
            className="ml-auto size-8 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent md:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Role-specific navigation */}
        <div className="flex-1 overflow-y-auto px-2 py-6">
          {!isCollapsed && (
            <p className="eyebrow mb-3 px-2 text-muted-foreground">
              {workspaceLabel}
            </p>
          )}

          <nav aria-label="Dashboard navigation" className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                item.href === dashboardHref
                  ? isDashboardActive
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Button
                  key={item.href}
                  type="button"
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => onNavigate(item.href)}
                  aria-current={isActive ? "page" : undefined}
                  title={isCollapsed ? item.label : undefined}
                  className={`
                    h-10 w-full rounded-lg
                    ${isCollapsed ? "justify-center px-2" : "justify-start gap-3 px-3"}
                    ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }
                  `}
                >
                  <Icon className="size-[18px] shrink-0" />

                  {!isCollapsed && (
                    <span className="truncate text-sm font-medium">
                      {item.label}
                    </span>
                  )}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* User information and shared navigation */}
        <div className="shrink-0 border-t border-sidebar-border p-3">
          <div
            className={`
              mb-2 flex items-center gap-2 rounded-lg
              p-2
              ${isCollapsed ? "md:justify-center md:px-0" : ""}
            `}
          >
            <Avatar className="size-9 shrink-0">
              <AvatarImage
                src={userImage || undefined}
                alt={userName || "User"}
              />
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-sidebar-foreground">
                  {userName || "User"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {roleLabel}
                </p>
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onNavigate("/dashboard/profile")}
              className="size-8 shrink-0 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              title="Profile settings"
              aria-label="Profile settings"
            >
              <Settings className="size-4" />
            </Button>
          </div>

          {SHARED_NAVIGATION.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Button
                key={item.href}
                type="button"
                variant="ghost"
                onClick={() => onNavigate(item.href)}
                aria-current={isActive ? "page" : undefined}
                title={isCollapsed ? item.label : undefined}
                className={`
                  h-10 w-full rounded-lg
                  ${isCollapsed ? "justify-center px-2" : "justify-center gap-2"}
                  ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }
                `}
              >
                <Icon className="size-4 shrink-0" />

                {!isCollapsed && (
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </aside>
    </>
  );
}

// -----------------------------------------------------------------------------
// Dashboard header and user dropdown
// -----------------------------------------------------------------------------

type DashboardHeaderProps = {
  userName?: string | null;
  userEmail?: string | null;
  userImage?: string | null;
  userRole: UserRole | null;
  roleLabel: string;
  dashboardHref: string;
  breadcrumbs: BreadcrumbItem[];
  onOpenMobileSidebar: () => void;
  onLogout: () => void;
};

function DashboardHeader({
  userName,
  userEmail,
  userImage,
  userRole,
  roleLabel,
  dashboardHref,
  breadcrumbs,
  onOpenMobileSidebar,
  onLogout,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // setMounted(true);
  }, []);

  const initials = getInitials(userName);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
      {/* Left side: mobile menu and breadcrumbs */}
      <div className="flex min-w-0 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onOpenMobileSidebar}
          className="shrink-0 md:hidden"
          aria-label="Open dashboard navigation"
        >
          <Menu className="size-5" />
        </Button>

        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-2 text-sm"
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <div
                key={`${item.label}-${index}`}
                className="flex min-w-0 items-center gap-2"
              >
                {index > 0 && (
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                )}

                {item.href && !isLast ? (
                  <button
                    type="button"
                    onClick={() => router.push(item.href!)}
                    className="truncate text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span
                    aria-current="page"
                    className="truncate font-semibold text-foreground"
                  >
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Right side: homepage, theme, and user capsule */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {/* <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/")}
          className="hidden h-9 gap-2 px-2 text-sm text-muted-foreground hover:text-foreground sm:inline-flex"
        >
          <ArrowLeft className="size-4" />
          Back to Homepage
        </Button> */}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="size-9 shrink-0 rounded-full"
          aria-label="Toggle color theme"
          title="Toggle color theme"
        >
          {mounted && resolvedTheme === "dark" ? (
            <Moon className="size-[18px]" />
          ) : (
            <Sun className="size-[18px]" />
          )}
        </Button>

        {/* User capsule */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="
                  flex h-11
                  w-[min(340px,42vw)]
                  min-w-0 items-center gap-2
                  rounded-xl border-border
                  bg-card px-2.5 shadow-sm
                  hover:bg-muted
                "
              />
            }
          >
            <Avatar className="size-8 shrink-0">
              <AvatarImage
                src={userImage || undefined}
                alt={userName || "User"}
              />
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-foreground">
              {userName || "User"}
            </span>

            <Badge
              className="hidden shrink-0 rounded-full border-0 px-3 py-0.5 text-xs font-semibold sm:inline-flex"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--brand-secondary) 12%, transparent)",
                color: "var(--brand-secondary)",
              }}
            >
              {roleLabel}
            </Badge>

            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            style={{
              width: "var(--anchor-width)",
            }}
            className="z-[100] min-w-0 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-lg"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-2 font-normal">
                <p className="text-sm font-medium text-muted-foreground">
                  Signed in as
                </p>

                <p className="mt-1 break-all text-sm font-bold text-foreground">
                  {userEmail}
                </p>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => router.push(dashboardHref)}
              className="cursor-pointer gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium"
            >
              <LayoutDashboard className="size-4 text-primary" />
              {roleLabel} Dashboard
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/dashboard/profile")}
              className="cursor-pointer gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium"
            >
              <UserRound className="size-4" />
              Update Profile
            </DropdownMenuItem>

            {userRole === "customer" && (
              <DropdownMenuItem
                onClick={() =>
                  router.push("/dashboard/customer/repairs")
                }
                className="cursor-pointer gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium"
              >
                <Wrench className="size-4" />
                My Repairs
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={onLogout}
              className="cursor-pointer gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium text-destructive focus:text-destructive"
            >
              <LogOut className="size-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// -----------------------------------------------------------------------------
// Main dashboard layout
// -----------------------------------------------------------------------------

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    data: session,
    isPending,
    refetch,
  } = useSession();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Better Auth user information.
  const userName = session?.user.name;
  const userEmail = session?.user.email;
  const userImage = session?.user.image;

  const rawUserRole: unknown = session?.user.role;

  const userRole = isUserRole(rawUserRole) ? rawUserRole : null;

  const roleLabel = userRole
    ? USER_ROLES[userRole].label
    : "Member";

  const dashboardHref = userRole
    ? ROLE_DASHBOARD_PATHS[userRole]
    : "/dashboard";

  const roleNavigation = userRole ? ROLE_NAVIGATION[userRole] : [];

  // Find the current page for the breadcrumb.
  const allNavigationItems = [
    ...roleNavigation,
    ...SHARED_NAVIGATION,
  ];

  const activeNavigationItem = getActiveNavigationItem(
    pathname,
    allNavigationItems,
  );

  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Dashboard",
      href: dashboardHref,
    },
  ];

  if (
    activeNavigationItem &&
    activeNavigationItem.href !== dashboardHref
  ) {
    breadcrumbItems.push({
      label: activeNavigationItem.label,
    });
  }

  // Logout.
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

  const handleNavigate = (href: string) => {
    router.push(href);
    setIsMobileSidebarOpen(false);
  };

  // Prevent displaying a blank sidebar while Better Auth checks the session.
  if (isPending) {
    return (
      <div className="flex min-h-dvh bg-background">
        <div className="hidden w-[260px] shrink-0 border-r border-sidebar-border bg-sidebar p-5 md:block">
          <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
          <div className="mt-12 space-y-3">
            <div className="h-4 w-36 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
          </div>
        </div>

        <div className="flex-1">
          <div className="h-16 border-b border-border" />
          <div className="space-y-4 p-6">
            <div className="h-8 w-64 animate-pulse rounded bg-muted" />
            <div className="h-40 w-full animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-background text-foreground">
      {/* Shared sidebar */}
      <DashboardSidebar
        userRole={userRole}
        userName={userName}
        userImage={userImage}
        roleLabel={roleLabel}
        pathname={pathname}
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onToggleCollapse={() =>
          setIsSidebarCollapsed((previous) => !previous)
        }
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Main dashboard area */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Shared header */}
        <DashboardHeader
          userName={userName}
          userEmail={userEmail}
          userImage={userImage}
          userRole={userRole}
          roleLabel={roleLabel}
          dashboardHref={dashboardHref}
          breadcrumbs={breadcrumbItems}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onLogout={() => void handleLogout()}
        />

        {/* Role-specific dashboard page */}
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}