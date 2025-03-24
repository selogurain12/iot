import axios from "axios";
import { AlertDialog } from "../ui/alert-dialog/alert-dialog";
import { AlertDialogContent } from "../ui/alert-dialog/alert-dialog-content";
import { AlertDialogDescription } from "../ui/alert-dialog/alert-dialog-description";
import { AlertDialogFooter } from "../ui/alert-dialog/alert-dialog-footer";
import { AlertDialogHeader } from "../ui/alert-dialog/alert-dialog-header";
import { AlertDialogTitle } from "../ui/alert-dialog/alert-dialog-title";
import { MotionAlertDialogActionWrapper } from "../ui/alert-dialog/motion/action-wrapper.motion";
import { MotionAlertDialogCancelWrapper } from "../ui/alert-dialog/motion/cancel-wrapper.motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface DeleteUserModalProps {
    closeModal: () => void;
    isModalDeleteOpen: boolean;
    id: string;
    refreshData: () => Promise<void>;
}


export function DeleteUser({closeModal, id, isModalDeleteOpen, refreshData}: DeleteUserModalProps) {
    const navigate = useNavigate();
    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        try {
            const response = await axios.delete(`http://localhost:3001/users/${id}`);
            console.log(response)
            if (response.status === 200) {
                toast.success("L'utilisateur a bien été supprimé");
                await refreshData();
                setTimeout(() => {
                    navigate("/userlist");
                    closeModal();
                }, 1000);
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi des données:", error);
        }
    };

    return(
        <AlertDialog open={isModalDeleteOpen} onOpenChange={closeModal}>
			<AlertDialogContent className="sm:max-w-[800px] sm:max-h-[80%] overflow-y-scroll bg-white rounded-lg p-8">
				<AlertDialogHeader>
					<AlertDialogTitle>Supprimer un utilisateur</AlertDialogTitle>
					<AlertDialogDescription>
						Êtes-vous sûr de vouloir supprimer cet utilisateur ?
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<MotionAlertDialogCancelWrapper onClick={closeModal}	/>
					<MotionAlertDialogActionWrapper onClick={() => handleSubmit({ preventDefault: () => {} })} />
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
    )
}