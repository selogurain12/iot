import { useLocation } from "react-router-dom";
import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

export function NavProjects({
  projects,
}: {
  projects: {
    name: string;
    url?: string; // `url` devient optionnel
    icon: LucideIcon;
    action?: () => void; // Ajout d'une action facultative
  }[];
}) {
  const location = useLocation();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        {projects.map((item) => {
          const isActive = location.pathname === item.url;

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                {item.action ? ( // Si une action est présente, on utilise un bouton
                  <button
                    onClick={item.action}
                    className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-200"
                  >
                    <item.icon />
                    <span>{item.name}</span>
                  </button>
                ) : (
                  <a
                    href={item.url}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                      isActive ? "bg-gray-300 text-gray-700" : "hover:bg-gray-200"
                    }`}
                  >
                    <item.icon className={`${isActive ? "text-gray-700" : ""}`} />
                    <span>{item.name}</span>
                  </a>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

