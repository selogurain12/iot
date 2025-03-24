import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectLabel, SelectGroup, SelectValue } from "../ui/select";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { UserDto } from "../dtos/user.dto";

interface AddCardProps {
    id: string;
    closeModal: () => void;
    refreshData: () => Promise<void>;
}

export function AddCard({ id, closeModal, refreshData }: AddCardProps) {
    const [data, setData] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:3001/users`
                );
                setData(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const navigate = useNavigate();

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        try {
            // Assurez-vous de soumettre l'ID de l'utilisateur sélectionné ici
            await axios.post("http://localhost:3001/rfid", { userId: selectedUser });
            toast.success("Carte RFID ajoutée avec succès");
            navigate("/userlist");
            refreshData();
            closeModal();
        } catch (error) {
            console.error("Erreur lors de l'envoi des données:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg w-[400px]">
                <Card>
                    <CardHeader>
                        <CardTitle>Ajouter une carte RFID</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {loading ? (
                            <p>Chargement des utilisateurs...</p>
                        ) : (
                            <div className="w-full">
                            <Select value={selectedUser} onValueChange={setSelectedUser}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sélectionner un utilisateur" /> {/* Affiche la valeur sélectionnée ici */}
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Choisir un utilisateur</SelectLabel>
                                        {data.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.firstname} {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            </div>
                        )}
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
