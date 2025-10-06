"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: "Admin", href: "/dashboards/admin" },
    ];

    if (pathname.includes("/dashboards/admin")) {
      if (tab) {
        const tabLabels: Record<string, string> = {
          overview: "Overview",
          analytics: "Analytics",
          users: "Users",
          courses: "Courses",
          applications: "Applications",
          payments: "Payments",
          notifications: "Notifications",
          settings: "Settings",
        };

        items.push({
          label: tabLabels[tab] || tab.charAt(0).toUpperCase() + tab.slice(1),
          isActive: true,
        });
      } else {
        items.push({ label: "Overview", isActive: true });
      }
    }

    return items;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600">
      <Link
        href="/dashboards/admin"
        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
      >
        <Home className="h-4 w-4" />
        <span>Dashboard</span>
      </Link>

      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.isActive ? (
            <span className="text-gray-900 font-medium">{item.label}</span>
          ) : (
            <Link
              href={item.href || "#"}
              className="hover:text-blue-600 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}


