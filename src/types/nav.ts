import { type LucideIcon } from "lucide-react";
import { type UserRole } from "./database";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[];
}
