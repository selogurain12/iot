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
import { useAuth } from "../../context/authContext"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, signOut } = useAuth()

  // Exemple de rôle utilisateur (tu peux l'ajuster selon ton système d'authentification)
  const isAdmin = user?.role === "admin"; // Exemple : l'utilisateur doit être admin pour accéder à tout
  const isUser = user?.role === "user"; // Exemple : un utilisateur classique, avec des restrictions

  // Définition des données en fonction du rôle de l'utilisateur
  const data = {
    user: [
      {
        name: user?.firstname + " " + user?.name,
        url: "/profil",
        icon: User,
      },
      {
        name: "Déconnexion",
        url: "#",
        icon: LogOut,
        action: signOut,
      },
    ],
    projects: [
      // Les projets accessibles aux administrateurs
      ...(isAdmin
        ? [
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
          ]
        : []),
      // Les projets accessibles aux utilisateurs
      ...(isUser
        ? [
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
          ]
        : []),
    ],
  }

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
