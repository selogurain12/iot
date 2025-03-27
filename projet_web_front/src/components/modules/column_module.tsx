import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../ui/tables/table-column-header";

export function ModuleColumn(): ColumnDef<{ out: string; in: string }>[] {
    return [
        {
            id: "out",
            meta: "OUT",
            accessorKey: "out",
            enableHiding: false,
            enableSorting: false,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} enableHide={false} title="OUT" className="text-center w-32" />
            ),
            cell: ({ row }) => (
                <div className="flex space-x-2 justify-center w-32">
                    <span className="truncate font-medium text-center">{row.getValue("out")}</span>
                </div>
            ),
        },
        {
            id: "in",
            meta: "IN",
            accessorKey: "in",
            enableHiding: false,
            enableSorting: false,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} enableHide={false} title="IN" className="text-center w-32" />
            ),
            cell: ({ row }) => (
                <div className="flex space-x-2 justify-center w-32">
                    <span className="truncate font-medium text-center">{row.getValue("in")}</span>
                </div>
            ),
        }
    ];
}
