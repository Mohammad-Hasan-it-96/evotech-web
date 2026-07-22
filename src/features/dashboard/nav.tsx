import {
  Building2,
  CreditCard,
  LayoutDashboard,
  Megaphone,
  Package,
  Rocket,
  Smartphone,
  Tags,
  type LucideIcon,
} from "lucide-react";

export interface DashboardNavItem {
  key:
    | "overview"
    | "subscriptions"
    | "clients"
    | "products"
    | "devices"
    | "plans"
    | "releases"
    | "notifications";
  href: string;
  icon: LucideIcon;
}

export const dashboardNav: DashboardNavItem[] = [
  { key: "overview", href: "/dashboard", icon: LayoutDashboard },
  { key: "subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
  // Consumer-app devices: a separate subscriber kind from Subscriptions above,
  // whose subscriber is a Company (ADR 0010).
  { key: "devices", href: "/dashboard/devices", icon: Smartphone },
  // Pricing for those apps. Separate from Products' platform plans: these are
  // duration-based, keyed by a string the shipped builds send back.
  { key: "plans", href: "/dashboard/plans", icon: Tags },
  // The Download Center: versioned builds and the permanent URLs that serve them.
  { key: "releases", href: "/dashboard/releases", icon: Rocket },
  // Custom push: offers, updates, announcements — test to one device, then broadcast.
  { key: "notifications", href: "/dashboard/notifications", icon: Megaphone },
  { key: "clients", href: "/dashboard/clients", icon: Building2 },
  { key: "products", href: "/dashboard/products", icon: Package },
];
