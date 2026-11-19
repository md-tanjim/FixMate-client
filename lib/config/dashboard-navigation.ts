import {
  LayoutDashboard,
  CalendarDays,
  Receipt,
  PlusCircle,
  Wrench,
  ClipboardList,
  Users,
  ClipboardCheck,
  ArrowLeftRight,
  UserRoundPen,
} from "lucide-react";

import type { UserRole } from "@/lib/config/user-roles";

export const DASHBOARD_NAVIGATION = {
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
      icon: ClipboardCheck,
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
} satisfies Record<UserRole, {
  label: string;
  href: string;
  icon: React.ElementType;
}[]>;

export const SHARED_DASHBOARD_NAVIGATION = [
  {
    label: "Update Profile",
    href: "/dashboard/profile",
    icon: UserRoundPen,
  },
];