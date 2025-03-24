import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../ui/tables/table-column-header";
import { HistoriqueDto } from "../dtos/historique.dto";

export function HistoriqueColumns(): ColumnDef<HistoriqueDto>[] {
    return [
        {
            id: "email",
            meta: "Email",
            accessorKey: "email",
            enableHiding: false,
            enableSorting: false,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} enableHide={false} title="Email" className="text-center w-32" />
            ),
            cell: ({ row }) => (
                <div className="flex space-x-2 justify-center w-32">
                    <span className="truncate font-medium text-center">{row.getValue("email")}</span>
                </div>
            ),
        },
        {
            id: "date",
            meta: "Date",
            accessorKey: "date",
            enableHiding: false,
            enableSorting: false,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} enableHide={false} title="Date" className="text-center w-32" />
            ),
            cell: ({ row }) => (
                <div className="flex space-x-2 justify-center w-32">
                    <span className="truncate font-medium text-center">{row.getValue("date")}</span>
                </div>
            ),
        },
        {
            id: "hours",
            meta: "Heure",
            accessorKey: "hours",
            enableHiding: false,
            enableSorting: false,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} enableHide={false} title="Heure" className="text-center w-32" />
            ),
            cell: ({ row }) => (
                <div className="flex space-x-2 justify-center w-32">
                    <span className="w-full truncate font-medium text-center">{row.getValue("hours")}</span>
                </div>
            ),
        },
        {
            id: "result",
            meta: "Résultat",
            accessorKey: "result",
            enableHiding: false,
            enableSorting: false,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} enableHide={false} title="Résultat" className="text-center w-32" />
            ),
            cell: ({ row }) => (
                <div className="flex space-x-2 justify-center w-32">
                    <span className="w-full truncate font-medium text-center">{row.getValue("result")}</span>
                </div>
            ),
        }
    ];
}
