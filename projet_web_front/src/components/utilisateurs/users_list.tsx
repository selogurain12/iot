import { useState } from "react";
import { AppSidebar } from "../sidebar/app-sidebar";
import { Button } from "../ui/button";
import { SidebarProvider } from "../ui/sidebar";
import { CreateUserModal } from "./create_user";
import { UserTable } from "./user_table";

export function ListUsers() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return(
        <div className="h-screen relative flex overflow-hidden">
            <SidebarProvider>
                <AppSidebar />
            </SidebarProvider>
            <main className="h-full w-full flex-auto overflow-auto antialiased">
                <p className="text-5xl text-center">Utilisateurs</p>
                <div className="w-full py-5 justify-items-end grid pr-3">
                    <Button variant="outline" onClick={openModal}>Créer un utilisateur</Button>
                </div>

                {isModalOpen && <CreateUserModal closeModal={closeModal} />}
                <div className="p-5">
                    <UserTable />
                </div>
            </main>
        </div>
    )
}
