export type MenuItem = {
  label: string;
  href: string;
  title: string;
  subtitle: string | null;
  button: {
    href: string;
    label: string;
    labelMobile: string | null;
  } | null;
  children?: MenuItem[];
  editRoutes?: {
    pattern: string;
    title: string;
    subtitle: string | null;
    button: {
      href: string;
      label: string;
      labelMobile: string | null;
    } | null;
  }[];
};

