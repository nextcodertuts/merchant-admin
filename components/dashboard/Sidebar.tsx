"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/auth/actions";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Building2,
  Package,
  FileText,
  LogOut,
  Users,
  FileBarChart,
  Crown,
  Receipt,
  Landmark,
  Hash,
} from "lucide-react";
import type { User as UserType } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  user: UserType;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Building2, label: "Business", href: "/dashboard/business" },
  { icon: Package, label: "Products", href: "/dashboard/products" },
  { icon: FileText, label: "Invoices", href: "/dashboard/invoices" },
  { icon: Users, label: "Customers", href: "/dashboard/clients" },
  { icon: Receipt, label: "Expenses", href: "/dashboard/expenses" },
  { icon: Landmark, label: "Loan", href: "/dashboard/loan" },
  {
    icon: FileBarChart,
    label: "Client Reports",
    href: "/dashboard/reports/clients",
    requiresGold: true,
  },
  {
    icon: Hash,
    label: "Trends",
    href: "/dashboard/search-trends",
    requiresGold: true,
  },
];

const subscriptionBadgeVariants = {
  basic: "bg-gray-500",
  silver: "bg-gray-300 text-white",
  gold: "bg-yellow-400 text-black",
};

export function Sidebar({ user }: SidebarProps) {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();

  // Filter menu items based on subscription
  const filteredMenuItems = menuItems.filter(
    (item) => !item.requiresGold || user.subscriptionId === "gold"
  );

  return (
    <aside
      className={cn(
        "flex flex-col bg-white border-r border-gray-200 h-screen transition-all duration-300",
        expanded ? "w-64" : "w-20"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h1
          className={cn(
            "font-bold transition-all duration-300",
            expanded ? "text-xl" : "text-xs"
          )}
        >
          {expanded ? "nextInvoice" : "nI"}
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronLeft /> : <ChevronRight />}
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <span
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-lg transition-all",
                  pathname === item.href
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  !expanded && "justify-center"
                )}
              >
                <Icon className="h-5 w-5" />
                {expanded && <span>{item.label}</span>}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div
          className={cn(
            "flex items-center space-x-2 mb-4 group relative cursor-pointer",
            !expanded && "justify-center"
          )}
        >
          <Avatar>
            <AvatarFallback>
              {user.name?.charAt(0) || user.email.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {expanded && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.name || "User"}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <Badge
                  className={cn(
                    "text-xs",
                    subscriptionBadgeVariants[
                      user.subscriptionId as keyof typeof subscriptionBadgeVariants
                    ]
                  )}
                >
                  <Crown className="h-3 w-3 mr-1" />
                  {user.subscriptionId}
                </Badge>
              </div>
            </div>
          )}

          {/* Logout button that appears on hover */}
          <div className="absolute right-0 top-0 h-full w-full flex items-center justify-center bg-white/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {expanded && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
