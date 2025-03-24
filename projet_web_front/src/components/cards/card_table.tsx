import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "../ui/tables/data-table";
import { CardDto } from "../dtos/card.dto";
import { CardColumns } from "./column_card";
import { UpdateCard } from "./update_card";
import { DeleteCard } from "./delete_card";
import { UpdatePIN } from "./update_pin";

export function CardTable() {
    const [data, setData] = useState<CardDto[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState<string | undefined>("");
    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
    const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
    const [isModalUpdatePinOpen, setIsModalUpdatePinOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    // Fonction pour rafraîchir les données
    const refreshData = useCallback(async () => {
        try {
            const response = await axios.get<CardDto[]>(
                `http://localhost:3000/users?page=${page}&limit=${itemsPerPage}&search=${search}`
            );
            setData(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs :", error);
        }
    }, [page, itemsPerPage, search]);

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


    return (
        <div>
            <DataTable
                data={data}
                columns={CardColumns({ openUpdateModal, openDeleteModal, openUpdatePinModal })}
                total={data.length}
                defaultItemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                setPage={setPage}
                setSearch={setSearch}
            />

            {isModalUpdateOpen && selectedUserId && (
                <UpdateCard id={selectedUserId} closeModal={closeUpdateModal} />
            )}
            
            {isModalDeleteOpen && selectedUserId && (
                <DeleteCard isModalDeleteOpen id={selectedUserId} closeModal={closeDeleteModal} refreshData={refreshData} />
            )}
            
            {isModalUpdatePinOpen && selectedUserId && (
                <UpdatePIN closeModal={closeUpdatePinModal} refreshData={refreshData} id={selectedUserId} />
            )}
        </div>
    );
}
