import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import axios from "axios";
import { toast } from "sonner";
import { AccessCodeDto } from "../dtos/access_code.dto";

interface UpdatePinModalProps {
    id: string;
    closeModal: () => void;
    refreshData: () => void;
}

export function UpdatePIN({ id, closeModal, refreshData }: UpdatePinModalProps) {
    const [newPin, setNewPin] = useState("");
    const [access, setAccess] = useState<AccessCodeDto>();
    console.log(id)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<AccessCodeDto>(
                    `http://localhost:3000/access/${id}`
                );
                setAccess(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des codes d'accès :", error);
            }
        };
    
        fetchData();
    }, [id]); // Ajout de 'id' comme dépendance pour éviter l'exécution infinie
    
    console.log(access)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(access)
        try {
            await axios.put(`http://localhost:3000/access`, { userId: access?.user_id, createCode: newPin });
            toast.success("Code PIN mis à jour avec succès");
            refreshData();
            closeModal();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("Erreur lors de la mise à jour du PIN");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg w-[400px]">
                <Card>
                    <CardHeader>
                        <CardTitle>Modifier le code PIN</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                <div>
                    <Label htmlFor="pin">Nouveau code PIN</Label>
                    <Input
                        id="pin"
                        type="text"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="Entrez le nouveau code PIN"
                        required
                    />
                </div>
                </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button onClick={handleSubmit}>Confirmer</Button>
                        <Button variant="outline" onClick={closeModal}>Annuler</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
