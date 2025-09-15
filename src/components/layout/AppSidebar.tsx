import { NavLink, useLocation } from "react-router-dom";
import {
  Calculator,
  Package,
  Users,
  Key,
  FileText,
  Puzzle,
  Settings,
  Shield,
  Database,
  BarChart3,
  Building
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const mainNavItems = [
  { title: "Kalkulator", url: "/", icon: Calculator },
  { title: "Services", url: "/services", icon: FileText },
  { title: "Pakete", url: "/packages", icon: Package },
  { title: "Lizenzen", url: "/licenses", icon: Key },
];

const managementItems = [
  { title: "Mitarbeiter", url: "/employees", icon: Users, adminOnly: true },
  { title: "Abteilungen", url: "/departments", icon: Building },
  { title: "Addon Services", url: "/addon-services", icon: Puzzle },
];

const configItems = [
  { title: "Package Config", url: "/package-config", icon: Settings },
  { title: "Kostenanalyse", url: "/cost-analysis", icon: BarChart3 },
  { title: "Backup", url: "/backup", icon: Database, adminOnly: true },
];

const adminItems = [
  { title: "Admin Panel", url: "/admin", icon: Shield },
];

export function AppSidebar() {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  const filterAdminItems = (items: typeof mainNavItems) => 
    items.filter(item => !item.adminOnly || isAdmin);

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible>
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Hauptfunktionen</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Verwaltung</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterAdminItems(managementItems).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Konfiguration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterAdminItems(configItems).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}