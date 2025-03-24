import * as React from "react"
import {
  CreditCard,
  History,
  LogOut,
  Settings,
  User,
  Users,
} from "lucide-react"

import { NavProjects } from "./nav-projects"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "../ui/sidebar"

const data = {
  user: [
    {
    name: "Prénom Nom",
    url: "#",
    icon: User,
    },
    {
      name: "Déconnexion",
      url: "#",
      icon: LogOut,
    }
  ],
  projects: [
    {
      name: "Utilisateurs",
      url: "/userlist",
      icon: Users,
    },
    {
      name: "Historique",
      url: "/historic",
      icon: History,
    },
    {
      name: "Cartes",
      url: "/card",
      icon: CreditCard,
    },
    {
      name: "Modules",
      url: "#",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
      <NavProjects projects={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
