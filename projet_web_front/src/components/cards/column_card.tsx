import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../ui/tables/table-column-header";
import { CardDto } from "../dtos/card.dto";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "../../components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { EllipsisVertical, Link2Off, Pencil, Trash2 } from "lucide-react";

interface CardColumnsProps {
    openUpdateModal: (cardId: string) => void;
    openDeleteModal: (cardId: string) => void
    openUpdatePinModal: (cardId: string) => void
    openDissociateModal: (cardId: string) => void
}

export function CardColumns({ openUpdateModal, openDeleteModal, openUpdatePinModal, openDissociateModal }: CardColumnsProps): ColumnDef<CardDto>[] {
    return [
        {
            id: "card_id",
            meta: "Id Carte",
            accessorKey: "card_id",
            enableHiding: false,
            enableSorting: false,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} enableHide={false} title="Id Carte" className="text-center w-32" />
            ),
            cell: ({ row }) => (
                <div className="flex space-x-2 justify-center w-32">
                    <span className="truncate font-medium text-center">{row.getValue("card_id")}</span>
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
                    <span className="w-full truncate font-medium text-center">{row.getValue("name")}</span>
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
            id: "pin_code",
            meta: "Code PIN",
            accessorKey: "pin_code",
            enableHiding: false,
            enableSorting: false,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} enableHide={false} title="Code PIN" className="text-center w-32" />
            ),
            cell: ({ row }) => (
                <div className="flex space-x-2 justify-center w-32">
                    <span className="truncate font-medium text-center">{row.getValue("pin_code")}</span>
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
                                <DropdownMenuItem className="gap-2" onClick={() => openUpdateModal(row.original.card_id)}>
                                    <Pencil className="size-4" />
                                    Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2" onClick={() => openUpdatePinModal(row.original.id)}>
                                    <Pencil className="size-4" />
                                    Modifier le PIN
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2" onClick={() => openDissociateModal(row.original.id)}>
                                    <Link2Off className="size-4" />
                                    Dissocier de l'utilisateur
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
