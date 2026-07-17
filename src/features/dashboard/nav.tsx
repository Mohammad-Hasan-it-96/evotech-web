import {
  Building2,
  CreditCard,
  LayoutDashboard,
  Package,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

export interface DashboardNavItem {
  key: "overview" | "subscriptions" | "clients" | "products" | "devices";
  href: string;
  icon: LucideIcon;
}

export const dashboardNav: DashboardNavItem[] = [
  { key: "overview", href: "/dashboard", icon: LayoutDashboard },
  { key: "subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
  // Consumer-app devices: a separate subscriber kind from Subscriptions above,
  // whose subscriber is a Company (ADR 0010).
  { key: "devices", href: "/dashboard/devices", icon: Smartphone },
  { key: "clients", href: "/dashboard/clients", icon: Building2 },
  { key: "products", href: "/dashboard/products", icon: Package },
];
