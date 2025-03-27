import { AppSidebar } from "../sidebar/app-sidebar";
import { SidebarProvider } from "../ui/sidebar";
import { UserTable } from "./user_table";

export function ListUsers() {
    return (
        <div className="h-screen relative flex overflow-hidden">
            <SidebarProvider>
                <AppSidebar />
            </SidebarProvider>
            <main className="h-full w-full flex-auto overflow-auto antialiased">
                <p className="text-5xl text-center">Utilisateurs</p>
                <div className="p-5">
                    <UserTable />
                </div>
            </main>
        </div>
    );
}
