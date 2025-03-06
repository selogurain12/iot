import { useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "../ui/tables/data-table";
import { UserColumns } from "./column_users";
import { UserDto } from "../dtos/user.dto";
import { UpdateUserModal } from "./update_user";
import { DeleteUser } from "./delete_user";

export function UserTable() {
    const [data, setData] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState<string | undefined>("");
    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
    const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<UserDto[]>(
                    `http://localhost:3001/users?page=${page}&limit=${itemsPerPage}&search=${search}`
                );
                setData(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [page, itemsPerPage, search]);

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

    if (loading) return <p>Chargement...</p>;   

    return (
        <div>
            <DataTable
                data={data}
                columns={UserColumns({ openUpdateModal, openDeleteModal })}
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
                <DeleteUser isModalDeleteOpen id={selectedUserId} closeModal={closeDeleteModal} />
            )}
        </div>
    );
}
