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
    const { user } = useAuth(); // Récupère l'utilisateur depuis le contexte
    const [data, setData] = useState<UserDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Vérifier si user existe avant de tenter d'effectuer une requête
    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                try {
                    const response = await axios.get<UserDto>(`http://localhost:3000/users/${user.id}`);
                    setData(response.data);
                } catch (error) {
                    console.error("Erreur lors de la récupération des utilisateurs :", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [user]); // Si `user` change, on refait la requête

    // Fonction de rafraîchissement des données
    const refreshData = async () => {
        if (user) {
            try {
                const response = await axios.get<UserDto>(`http://localhost:3000/users/${user.id}`);
                setData(response.data); // Met à jour les données utilisateur après le refresh
            } catch (error) {
                console.error("Erreur lors du rafraîchissement des données utilisateur :", error);
            }
        }
    };

    // Ouverture et fermeture du modal
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Lorsque le modal est fermé, on actualise les données
    const handleModalClose = () => {
        closeModal();
        refreshData(); // Rafraîchit les données après fermeture du modal
    };

    if (loading || !user) return <p>Chargement...</p>; // Si user est null ou en cours de chargement, afficher "Chargement..."

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
                    closeModal={handleModalClose} // Appel de `handleModalClose` pour fermer et actualiser
                    id={user.id}
                    refreshData={refreshData} // Passer la fonction de rafraîchissement des données
                />
            )}
        </div>
    );
}
