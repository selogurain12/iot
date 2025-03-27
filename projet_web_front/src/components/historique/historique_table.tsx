import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "../ui/tables/data-table";
import { useAuth } from "../../context/authContext";
import { AccessLog } from "../dtos/accesslog.dto";
import { HistoriqueColumns } from "./column_historique";

export function AccessLogTable() {
    const { user } = useAuth();
    const [data, setData] = useState<AccessLog[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState<string | undefined>("");
    const { token } = useAuth();

    // Fonction pour récupérer les logs d'accès
    const refreshData = useCallback(async () => {
        try {
            const response = await axios.get<AccessLog[]>(
                `http://localhost:3000/rfid/access_logs/all?page=${page}&limit=${itemsPerPage}&search=${search}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            // Filtrage des logs en fonction du rôle de l'utilisateur
            if (user?.role === "user") {
                // Si l'utilisateur est un 'user', on filtre les logs pour afficher uniquement ceux qui lui appartiennent
                const userHistorique = response.data.filter(historic => historic.user_id === user.id);
                console.log(userHistorique);
                setData(userHistorique); // On met à jour avec les logs filtrés
            } else {
                // Si l'utilisateur est un admin, on peut afficher tous les logs d'accès
                const allHistorique = response.data.filter(historic => historic.user_id !== null);
                setData(allHistorique); // On met à jour avec tous les logs
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des logs d'accès :", error);
        }
    }, [page, itemsPerPage, search, token, user]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    return (
        <div>
            <DataTable
                data={data}
                columns={HistoriqueColumns()}
                total={data.length}
                defaultItemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                setPage={setPage}
                setSearch={setSearch}
            />
        </div>
    );
}
