import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "../ui/tables/data-table";
import { HistoriqueDto } from "../dtos/historique.dto";
import { HistoriqueColumns } from "./column_historique";

export function HistoriqueTable() {
    const [data, setData] = useState<HistoriqueDto[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState<string | undefined>("");

    const refreshData = useCallback(async () => {
        try {
            const response = await axios.get<HistoriqueDto[]>(
                `http://10.33.76.16:3000/users?page=${page}&limit=${itemsPerPage}&search=${search}`
            );
            setData(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs :", error);
        }
    }, [page, itemsPerPage, search]);

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
