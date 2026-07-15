import {
  Building2,
  CreditCard,
  LayoutDashboard,
  Package,
  type LucideIcon,
} from "lucide-react";

export interface DashboardNavItem {
  key: "overview" | "subscriptions" | "clients" | "products";
  href: string;
  icon: LucideIcon;
}

export const dashboardNav: DashboardNavItem[] = [
  { key: "overview", href: "/dashboard", icon: LayoutDashboard },
  { key: "subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
  { key: "clients", href: "/dashboard/clients", icon: Building2 },
  { key: "products", href: "/dashboard/products", icon: Package },
];
