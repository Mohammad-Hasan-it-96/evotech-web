/** Shared navigation definition used by header and footer. `key` maps to the `nav` messages. */
export const navItems = [
  { key: "home", href: "/" },
  { key: "services", href: "/services" },
  { key: "products", href: "/products" },
  { key: "pricing", href: "/pricing" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const;
