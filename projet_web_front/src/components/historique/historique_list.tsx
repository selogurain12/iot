import { AppSidebar } from "../sidebar/app-sidebar";
import { SidebarProvider } from "../ui/sidebar";
import { AccessLogTable } from "./historique_table";

export function ListHistorique() {
    return (
        <div className="h-screen relative flex overflow-hidden">
            <SidebarProvider>
                <AppSidebar />
            </SidebarProvider>
            <main className="h-full w-full flex-auto overflow-auto antialiased">
                <p className="text-5xl text-center">Historique</p>
                <div className="p-5">
                    <AccessLogTable />
                </div>
            </main>
        </div>
    );
}
