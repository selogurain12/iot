import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "../ui/tables/data-table";
import { UserColumns } from "./column_users";
import { UserDto } from "../dtos/user.dto";
import { UpdateUserModal } from "./update_user";
import { DeleteUser } from "./delete_user";
import { CreateUserModal } from "./create_user";
import { Button } from "../ui/button";
import { AddCard } from "./add_card";
import { UpdatePIN } from "./update_pin";

export function UserTable() {
    const [data, setData] = useState<UserDto[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState<string | undefined>("");
    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
    const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
    const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
    const [isModalAssociateOpen, setIsModalAssociateOpen] = useState(false);
    const [isModalUpdatePinOpen, setIsModalUpdatePinOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    // Fonction pour rafraîchir les données
    const refreshData = useCallback(async () => {
        try {
            const response = await axios.get<UserDto[]>(
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

    const openAssociateModal = (userId: string) => {
        setSelectedUserId(userId);
        setIsModalAssociateOpen(true);
    };

    const closeUpdatePinModal = () => {
        setIsModalUpdatePinOpen(false);
        setSelectedUserId(null);
    };

    const openUpdatePinModal = (userId: string) => {
        setSelectedUserId(userId);
        setIsModalUpdatePinOpen(true);
    };

    const closeAssociateModal = () => {
        setIsModalAssociateOpen(false);
        setSelectedUserId(null);
    };

    const openCreateModal = () => {
        setIsModalCreateOpen(true);
    };

    const closeCreateModal = () => {
        setIsModalCreateOpen(false);
    };


    console.log(isModalAssociateOpen)
    return (
        <div>
            <div className="w-full py-5 justify-items-end grid pr-3">
                    <Button variant="outline" onClick={openCreateModal}>Créer un utilisateur</Button>
                </div>
            <DataTable
                data={data}
                columns={UserColumns({ openUpdateModal, openDeleteModal, openAssociateModal, openUpdatePinModal })}
                total={data.length}
                defaultItemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                setPage={setPage}
                setSearch={setSearch}
            />
            {isModalUpdateOpen && selectedUserId && (
                <UpdateUserModal id={selectedUserId} closeModal={closeUpdateModal} />
            )}

            {isModalDeleteOpen && selectedUserId && (
                <DeleteUser isModalDeleteOpen id={selectedUserId} closeModal={closeDeleteModal} refreshData={refreshData} />
            )}

            {isModalCreateOpen && (
                <CreateUserModal closeModal={closeCreateModal} refreshData={refreshData} />
            )}

            {isModalAssociateOpen && selectedUserId && (
                <AddCard closeModal={closeAssociateModal} refreshData={refreshData} id={selectedUserId} />
            )}

            {isModalUpdatePinOpen && selectedUserId && (
                <UpdatePIN closeModal={closeUpdatePinModal} refreshData={refreshData} id={selectedUserId} />
            )}
        </div>
    );
}
