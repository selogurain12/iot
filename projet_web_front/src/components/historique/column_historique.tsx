import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../ui/tables/table-column-header";
import { AccessLog } from "../dtos/accesslog.dto";
import { Badge } from "../ui/badge";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export function HistoriqueColumns(): ColumnDef<AccessLog>[] {
    return [
        {
            id: "identifier",
            meta: "Id de la carte",
            accessorKey: "identifier",
            enableHiding: false,
            enableSorting: false,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} enableHide={false} title="Id de la carte" className="text-center w-32" />
            ),
            cell: ({ row }) => (
                <div className="flex space-x-2 justify-center w-32">
                    <span className="truncate font-medium text-center">{row.getValue("identifier")}</span>
                </div>
            ),
        },
        {
            id: "user_id",
            meta: "Id du user",
            accessorKey: "user_id",
            enableHiding: false,
            enableSorting: false,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} enableHide={false} title="Id du user" className="text-center w-32" />
            ),
            cell: ({ row }) => (
                <div className="flex space-x-2 justify-center w-32">
                    <span className="w-full truncate font-medium text-center">{row.getValue("user_id")}</span>
                </div>
            ),
        },
        {
            id: "success",
            meta: "Etat",
            accessorKey: "success",
            enableHiding: false,
            enableSorting: false,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} enableHide={false} title="Etat" className="text-center w-32" />
            ),
            cell: ({ row }) => {
                const isSuccess = row.getValue("success");
        
                return (
                    <div className="flex space-x-2 justify-center w-32">
                        {isSuccess ? (
                            <Badge className="bg-green-500 text-white px-3 py-1">Succès</Badge>
                        ) : (
                            <Badge className="bg-red-500 text-white px-3 py-1">Échec</Badge>
                        )}
                    </div>
                );
            },
        },

{
    id: "created_at",
    meta: "Date",
    accessorKey: "created_at",
    enableHiding: false,
    enableSorting: false,
    header: ({ column }) => (
        <DataTableColumnHeader column={column} enableHide={false} title="Date" className="text-center w-32" />
    ),
    cell: ({ row }) => {
        const rawDate: string = row.getValue("created_at");

        let formattedDate = "N/A";
        if (rawDate) {
            try {
                const parsedDate = parseISO(rawDate);
                formattedDate = format(parsedDate, "dd/MM/yyyy HH:mm", { locale: fr });
            } catch (error) {
                console.error("Erreur de formatage de date :", error);
            }
        }

        return (
            <div className="flex space-x-2 justify-center w-32">
                <span className="w-full truncate font-medium text-center">{formattedDate}</span>
            </div>
        );
    },
}

    ];
}
