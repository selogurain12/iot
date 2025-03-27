import { AppSidebar } from "../sidebar/app-sidebar";
import { SidebarProvider } from "../ui/sidebar";
import { ModuleTable } from "./module_table";

export function ListModules() {
    return (
        <div className="h-screen relative flex overflow-hidden">
            <SidebarProvider>
                <AppSidebar />
            </SidebarProvider>
            <main className="h-full w-full flex-auto overflow-auto antialiased">
                <p className="text-5xl text-center">Modules</p>
                <div className="p-5">
                    <ModuleTable />
                </div>
            </main>
        </div>
    );
}
