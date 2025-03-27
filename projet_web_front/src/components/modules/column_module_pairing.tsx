import { ColumnDef } from "@tanstack/react-table";

// Colonnes pour le tableau des modules IN et OUT
export function ModuleColumns(): ColumnDef<{ [key: string]: unknown }>[] {
    return [
        {
            id: "hostname",
            meta: "Module",
            accessorKey: "hostname",
            header: "Module",
            cell: ({ row }) => (
                <div className="text-center">{row.getValue("hostname")}</div>
            ),
        },
        {
            id: "type",
            meta: "Type",
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <div className="text-center">{row.getValue("type")}</div>
            ),
        }
    ];
}
