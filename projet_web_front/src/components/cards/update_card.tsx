import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectLabel, SelectGroup, SelectValue } from "../ui/select";
import axios from "axios";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { UserDto } from "../dtos/user.dto";
import { useAuth } from "../../context/authContext";
import { CardDto } from "../dtos/card.dto";

interface UpdateCardProps {
    closeModal: () => void;
    refreshData: () => Promise<void>;
    id: string;
}

export function UpdateCard({ closeModal, id, refreshData }: UpdateCardProps) {
    const [data, setData] = useState<UserDto[]>([]);
    const [card, setCard] = useState<CardDto | undefined>(undefined); // Initialiser à undefined
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<string>("");
    const { token } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<CardDto>(
                    `http://localhost:3000/rfid/card/${id}`
                );
                setCard(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des informations de la carte :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        if (card) {
            setSelectedUser(card.user_id);
        }
    }, [card]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get<UserDto[]>(
                    `http://localhost:3000/users`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                setData(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs :", error);
            }
        };

        fetchUsers();
    }, [token]);

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        try {
            // Assurez-vous de soumettre l'ID de l'utilisateur sélectionné ici
            await axios.put(`http://localhost:3000/rfid/${card?.id}`, {
                card_id: card?.card_id, // Utiliser card_id directement
                user_id: selectedUser
            });
            toast.success("Carte RFID mise à jour avec succès");
            refreshData();
            closeModal();
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la carte:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg w-[400px]">
                <Card>
                    <CardHeader>
                        <CardTitle>Modifier une carte RFID</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {loading ? (
                            <p>Chargement des informations...</p>
                        ) : (
                            <div>
                                {/* Affichage de card_id */}
                                <p><strong>Card ID:</strong> {card?.card_id}</p>
                            </div>
                        )}

                        {loading ? (
                            <p>Chargement des utilisateurs...</p>
                        ) : (
                            <div className="space-y-1">
                                <Select value={selectedUser} onValueChange={setSelectedUser}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Sélectionner un utilisateur" />
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
