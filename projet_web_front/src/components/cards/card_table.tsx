import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "../ui/tables/data-table";
import { CardDto } from "../dtos/card.dto";
import { CardColumns } from "./column_card";
import { UpdateCard } from "./update_card";
import { DeleteCard } from "./delete_card";
import { UpdatePIN } from "./update_pin";
import { Button } from "../ui/button";
import { AddCard } from "./add_card";
import { DissociateCard } from "./dissociate_user";
import { useAuth } from "../../context/authContext";  // Importer le contexte d'authentification

export function CardTable() {
    const { user } = useAuth();  // Obtenir l'utilisateur connecté
    const [data, setData] = useState<CardDto[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState<string | undefined>("");
    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
    const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
    const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
    const [isModalUpdatePinOpen, setIsModalUpdatePinOpen] = useState(false);
    const [isModalDissociateOpen, setIsModalDissociateOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    // Fonction pour rafraîchir les données
    const refreshData = useCallback(async () => {
        try {
            const response = await axios.get<CardDto[]>(
                `http://localhost:3000/rfid?page=${page}&limit=${itemsPerPage}&search=${search}`
            );
            
            // Si l'utilisateur est un "user", filtrer les cartes pour n'afficher que celles assignées à l'utilisateur connecté
            if (user?.role === "user") {
                const userCards = response.data.filter(card => card.user_id === user.id);
                setData(userCards);
            } else {
                // Si l'utilisateur est un admin, afficher toutes les cartes non assignées
                const unassignedCards = response.data.filter(card => card.user_id !== null);
                setData(unassignedCards);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des cartes :", error);
        }
    }, [page, itemsPerPage, search, user]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const openUpdateModal = (userId: string) => {
        setSelectedUserId(userId);
        setIsModalUpdateOpen(true);
    };

    const closeUpdateModal = () => {
        setIsModalUpdateOpen(false);
        setSelectedUserId(null);
    };

    const openDissociateModal = (userId: string) => {
        setSelectedUserId(userId);
        setIsModalDissociateOpen(true);
    };

    const closeDissociateModal = () => {
        setIsModalDissociateOpen(false);
        setSelectedUserId(null);
    };

    const openDeleteModal = (userId: string) => {
        setSelectedUserId(userId);
        setIsModalDeleteOpen(true);
    };

    const closeDeleteModal = () => {
        setIsModalDeleteOpen(false);
        setSelectedUserId(null);
    };

    const closeUpdatePinModal = () => {
        setIsModalUpdatePinOpen(false);
        setSelectedUserId(null);
    };

    const openUpdatePinModal = (userId: string) => {
        setSelectedUserId(userId);
        setIsModalUpdatePinOpen(true);
    };

    const openCreateModal = () => {
        setIsModalCreateOpen(true);
    };

    const closeCreateModal = () => {
        setIsModalCreateOpen(false);
    };

    return (
        <div>
            {/* Bouton visible uniquement pour les admins */}
            {user?.role === "admin" && (
                <div className="w-full py-5 justify-items-end grid pr-3">
                    <Button variant="outline" onClick={openCreateModal}>Créer une carte</Button>
                </div>
            )}

            <DataTable
                data={data}
                columns={CardColumns({
                    openUpdateModal,
                    openDeleteModal,
                    openUpdatePinModal,
                    openDissociateModal,
                })}
                total={data.length}
                defaultItemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                setPage={setPage}
                setSearch={setSearch}
            />

            {/* Modaux conditionnels en fonction du rôle de l'utilisateur */}
            {isModalUpdateOpen && selectedUserId && user?.role === "admin" && (
                <UpdateCard id={selectedUserId} closeModal={closeUpdateModal} refreshData={refreshData} />
            )}
            
            {isModalDeleteOpen && selectedUserId && user?.role === "admin" && (
                <DeleteCard isModalDeleteOpen id={selectedUserId} closeModal={closeDeleteModal} refreshData={refreshData} />
            )}
            
            {isModalUpdatePinOpen && selectedUserId && (
                <UpdatePIN closeModal={closeUpdatePinModal} refreshData={refreshData} id={selectedUserId} />
            )}

            {/* Le modal de création est limité aux admins */}
            {isModalCreateOpen && user?.role === "admin" && (
                <AddCard closeModal={closeCreateModal} refreshData={refreshData} />
            )}

            {isModalDissociateOpen && selectedUserId && user?.role === "admin" && (
                <DissociateCard closeModal={closeDissociateModal} refreshData={refreshData} id={selectedUserId} isModalDeleteOpen />
            )}
        </div>
    );
}
