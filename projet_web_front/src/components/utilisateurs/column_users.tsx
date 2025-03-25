import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../ui/tables/table-column-header";
import { UserDto } from "../dtos/user.dto"; // Assure-toi que le nom est correct
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { EllipsisVertical, Link2, Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";

interface UserColumnsProps {
    openUpdateModal: (userId: string) => void;
    openDeleteModal: (userId: string) => void
    openAssociateModal: (userId: string) => void
}

// Accept openModal as a prop
export function UserColumns({ openUpdateModal, openDeleteModal, openAssociateModal }: UserColumnsProps): ColumnDef<UserDto>[] {
    return [
        {
            id: "firstname",
            meta: "Prénom",
            accessorKey: "firstname",
            enableHiding: false,
            enableSorting: false,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} enableHide={false} title="Prénom" className="text-center w-32" />
            ),
            cell: ({ row }) => (
                <div className="flex space-x-2 justify-center w-32">
                    <span className="truncate font-medium text-center">{row.getValue("firstname")}</span>
                </div>
            ),
        },
        {
            id: "name",
            meta: "Nom",
            accessorKey: "name",
            enableHiding: false,
            enableSorting: false,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} enableHide={false} title="Nom" className="text-center w-32" />
            ),
            cell: ({ row }) => (
                <div className="flex space-x-2 justify-center w-32">
                    <span className="truncate font-medium text-center">{row.getValue("name")}</span>
                </div>
            ),
        },
        {
            id: "email",
            meta: "Mail",
            accessorKey: "email",
            enableHiding: false,
            enableSorting: false,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} enableHide={false} title="Mail" className="text-center w-32" />
            ),
            cell: ({ row }) => (
                <div className="flex space-x-2 justify-center w-32">
                    <span className="w-full truncate font-medium text-center">{row.getValue("email")}</span>
                </div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
            cell: ({ row }) => {
                return (
                    <div className="justify-end grid">
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button
                                    variant="third"
                                    className="block min-w-10 ml-auto hover:scale-110 duration-300 hover:text-primary-hover"
                                    size="icon"
                                >
                                    <EllipsisVertical className="size-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem className="gap-2" onClick={() => openUpdateModal(row.original.id)}>
                                    <Pencil className="size-4" />
                                    Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2" onClick={() => openAssociateModal(row.original.id)} >
                                    <Link2 className="size-4" />
                                    Associer à une carte
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 text-destructive" onClick={() => openDeleteModal(row.original.id)}>
                                    <Trash2 className="size-4" />
                                    Supprimer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        }
    ];
}
