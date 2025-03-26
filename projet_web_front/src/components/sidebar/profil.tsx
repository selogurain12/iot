import { CircleUserRound, Pencil, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { useAuth } from "../../context/authContext";
import { useEffect, useState } from "react";
import { UpdateUserModal } from "../utilisateurs/update_user";
import { UserDto } from "../dtos/user.dto";
import axios from "axios";

export function Profil() {
    const { user, token } = useAuth();
    const [data, setData] = useState<UserDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                try {
                    const response = await axios.get<UserDto>(`http://localhost:3000/users/${user.id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    setData(response.data);
                } catch (error) {
                    console.error("Erreur lors de la récupération des utilisateurs :", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [token, user]);

    const refreshData = async () => {
        if (user) {
            try {
                const response = await axios.get<UserDto>(`http://localhost:3000/users/${user.id}`);
                setData(response.data);
            } catch (error) {
                console.error("Erreur lors du rafraîchissement des données utilisateur :", error);
            }
        }
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleModalClose = () => {
        closeModal();
        refreshData();
    };

    if (loading || !user) return <p>Chargement...</p>;

    return (
        <div className="h-screen relative flex overflow-hidden">
            <SidebarProvider>
                <AppSidebar />
            </SidebarProvider>
            <main className="h-full w-full flex items-center justify-center overflow-auto antialiased">
                <div className="flex h-full w-full flex-col items-center space-y-6">
                    <p className="text-5xl">Profil</p>

                    <div className="bg-white w-fit h-fit p-10 rounded-lg shadow-lg relative">
                        <Button className="absolute top-4 right-4" variant="outline" onClick={openModal}>
                            <Pencil className="size-4" />
                        </Button>
                        <div className="top-6 relative justify-center flex">
                            <CircleUserRound className="size-48" />
                        </div>
                        <div className="mt-8 text-center">
                            <p className="text-xl font-semibold">{data?.firstname} {data?.name}</p>
                            <p className="text-lg text-gray-500">{data?.email}</p>
                        </div>
                        <div className="text-center top-4 relative">
                            <Button className="text-red-500 border-red-500 hover:bg-red-100" variant="outline">
                                <Trash className="text-red-500" />
                                Supprimer le compte
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            {isModalOpen && user && (
                <UpdateUserModal
                    closeModal={handleModalClose}
                    id={user.id}
                    refreshData={refreshData}
                />
            )}
        </div>
    );
}
