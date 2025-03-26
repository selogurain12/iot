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

interface DissociateCardModalProps {
    closeModal: () => void;
    isModalDeleteOpen: boolean;
    id: string;
    refreshData: () => Promise<void>;
}


export function DissociateCard({closeModal, id, isModalDeleteOpen, refreshData}: DissociateCardModalProps) {
    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:3000/rfid/${id}`, {
                user_id: null
            });
            console.log(response)
            if (response.status === 200) {
                toast.success("La carte a bien été dissociée");
                await refreshData();
                setTimeout(() => {
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
					<AlertDialogTitle>Dissocier la carte de l'utilisateur</AlertDialogTitle>
					<AlertDialogDescription>
						Êtes-vous sûr de vouloir dissocier cette carte de son utilisateur ?
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