
"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  LockKeyhole,
  Loader2,
  Users,
} from "lucide-react";

import {
  getAdminUsers,
  updateAdminUserRole,
  type AdminUser,
  type AdminUserRole,
  type AdminUsersFilter,
} from "@/lib/api/admin-dashboard";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";


const ROLE_FILTERS: {
  label: string;
  value: AdminUsersFilter;
}[] = [
  { label: "All Roles", value: "all" },
  { label: "Customer", value: "customer" },
  { label: "Technician", value: "technician" },
  { label: "Admin", value: "admin" },
];

// =============================================================================
// Helper functions
// =============================================================================

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

function formatDate(date: string | null) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

function formatRole(role: AdminUserRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function getRoleClasses(role: AdminUserRole) {
  switch (role) {
    case "customer":
      return "border-info/30 bg-info/10";

    case "technician":
      return "border-success/30 bg-success/10";

    case "admin":
      return "border-secondary/40 bg-secondary/15";

    default:
      return "border-border bg-muted";
  }
}

function getRoleDotClasses(role: AdminUserRole) {
  switch (role) {
    case "customer":
      return "bg-info";

    case "technician":
      return "bg-success";

    case "admin":
      return "bg-secondary";

    default:
      return "bg-muted-foreground";
  }
}

// =============================================================================
// User profile
// =============================================================================

function UserProfile({ user }: { user: AdminUser }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="h-10 w-10 shrink-0 border border-border">
        <AvatarImage
          src={user.image || undefined}
          alt={user.name}
        />

        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>

      <span className="truncate text-sm font-semibold text-foreground">
        {user.name}
      </span>
    </div>
  );
}

// =============================================================================
// Role control
// =============================================================================

function UserRoleControl({
  user,
  isDisabled,
  isUpdating,
  onRoleChange,
}: {
  user: AdminUser;
  isDisabled: boolean;
  isUpdating: boolean;
  onRoleChange: (id: string, role: AdminUserRole) => void;
}) {
  // The logged-in admin cannot change their own role.
  if (user.isCurrentUser) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex h-8 items-center gap-2 rounded-full border px-3 text-xs font-semibold text-foreground ${getRoleClasses(user.role)}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${getRoleDotClasses(user.role)}`}
          />

          {formatRole(user.role)}

          <LockKeyhole className="h-3 w-3 text-muted-foreground" />
        </span>

        <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
          Current Account (You)
        </span>
      </div>
    );
  }

  // Other users have an editable role dropdown.
  return (
    <div className="flex items-center gap-2">
      <Select
        value={user.role}
        onValueChange={(value) => {
          // Shadcn Select can return null.
          if (!value) return;

          onRoleChange(user.id, value as AdminUserRole);
        }}
        disabled={isDisabled}
      >
        <SelectTrigger
          className={`h-8 w-[135px] rounded-full border px-3 text-xs font-semibold !text-foreground shadow-none ${getRoleClasses(user.role)}`}
        >
          <SelectValue className="text-foreground" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="customer">
            <span className="flex items-center gap-2 text-foreground">
              <span className="h-2 w-2 rounded-full bg-info" />
              Customer
            </span>
          </SelectItem>

          <SelectItem value="technician">
            <span className="flex items-center gap-2 text-foreground">
              <span className="h-2 w-2 rounded-full bg-success" />
              Technician
            </span>
          </SelectItem>

          <SelectItem value="admin">
            <span className="flex items-center gap-2 text-foreground">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              Admin
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      {isUpdating && (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}

// =============================================================================
// Loading state — outside UsersTable
// =============================================================================

function LoadingState() {
  return (
    <>
      {/* Desktop loading skeleton */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Profile</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">
                Joined Date
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {Array.from({ length: 5 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-8 w-full max-w-[150px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile loading skeleton */}
      <div className="grid gap-3 p-3 md:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="space-y-3 rounded-lg border border-border p-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>

            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-28" />
          </div>
        ))}
      </div>
    </>
  );
}

// =============================================================================
// Empty state — outside UsersTable
// =============================================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
        <Users className="h-5 w-5 text-muted-foreground" />
      </div>

      <div>
        <h3 className="font-semibold text-foreground">
          No users found
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          There are no users under this role yet.
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// Main component
// =============================================================================

export default function UsersTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roleFilter, setRoleFilter] =
    useState<AdminUsersFilter>("all");

  const [totalUsers, setTotalUsers] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [updatingUserId, setUpdatingUserId] = useState<string | null>(
    null
  );

  // Changing this value triggers a fresh request.
  const [refreshKey, setRefreshKey] = useState(0);

  // ===========================================================================
  // Fetch users
  // ===========================================================================

  useEffect(() => {
    let cancelled = false;

    getAdminUsers(roleFilter)
      .then((result) => {
        if (cancelled) return;

        setUsers(result.users);
        setTotalUsers(result.totalUsers);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to retrieve users."
        );
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    // Ignore the response if the filter changes or the component unmounts.
    return () => {
      cancelled = true;
    };
  }, [roleFilter, refreshKey]);

  // ===========================================================================
  // Change role filter
  // ===========================================================================

  function handleRoleFilterChange(role: AdminUsersFilter) {
    if (role === roleFilter) return;

    setIsLoading(true);
    setError(null);
    setRoleFilter(role);
  }

  // ===========================================================================
  // Update user role
  // ===========================================================================

  async function handleRoleChange(
    userId: string,
    newRole: AdminUserRole
  ) {
    const selectedUser = users.find((user) => user.id === userId);

    if (!selectedUser || selectedUser.isCurrentUser) {
      return;
    }

    if (selectedUser.role === newRole) {
      return;
    }

    setUpdatingUserId(userId);

    try {
      await updateAdminUserRole(userId, newRole);

      toast.success("User role updated successfully.");

      // Refresh the list after the successful update.
      setIsLoading(true);
      setRefreshKey((previous) => previous + 1);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to update user role."
      );
    } finally {
      setUpdatingUserId(null);
    }
  }

  // ===========================================================================
  // Retry
  // ===========================================================================

  function handleRetry() {
    setIsLoading(true);
    setError(null);
    setRefreshKey((previous) => previous + 1);
  }

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <div className="w-full space-y-6">
      {/* Page heading */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Manage Users
        </h1>

        <p className="text-sm text-muted-foreground">
          View registered users and manage their account roles across FixMate.
        </p>
      </div>

      {/* Role filters and total users */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-muted p-1">
          {ROLE_FILTERS.map((filter) => {
            const isActive = roleFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => handleRoleFilterChange(filter.value)}
                disabled={updatingUserId !== null}
                aria-pressed={isActive}
                className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="flex w-fit items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold text-foreground">
          <span className="h-2 w-2 rounded-full bg-success" />

          Total Users: {totalUsers.toLocaleString()}
        </div>
      </div>

      {/* Users list */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
            <p className="text-sm text-destructive">{error}</p>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
            >
              Try again
            </Button>
          </div>
        ) : users.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[90px]">
                      Profile Photo
                    </TableHead>

                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>

                    <TableHead className="text-right">
                      Joined Date
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {users.map((user) => (
                    <TableRow
                      key={user.id}
                      className={
                        user.isCurrentUser
                          ? "bg-primary/[0.03]"
                          : ""
                      }
                    >
                      <TableCell>
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage
                            src={user.image || undefined}
                            alt={user.name}
                          />

                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>

                      <TableCell className="font-semibold text-foreground">
                        {user.name}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {user.email}
                      </TableCell>

                      <TableCell>
                        <UserRoleControl
                          user={user}
                          isUpdating={updatingUserId === user.id}
                          isDisabled={updatingUserId !== null}
                          onRoleChange={handleRoleChange}
                        />
                      </TableCell>

                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDate(user.joinedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile user cards */}
            <div className="grid gap-3 p-3 md:hidden">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`space-y-3 rounded-lg border p-3 ${
                    user.isCurrentUser
                      ? "border-primary/30 bg-primary/[0.03]"
                      : "border-border"
                  }`}
                >
                  <UserProfile user={user} />

                  <div className="break-all text-sm text-muted-foreground">
                    {user.email}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                    <UserRoleControl
                      user={user}
                      isUpdating={updatingUserId === user.id}
                      isDisabled={updatingUserId !== null}
                      onRoleChange={handleRoleChange}
                    />

                    <span className="text-xs text-muted-foreground">
                      Joined {formatDate(user.joinedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
