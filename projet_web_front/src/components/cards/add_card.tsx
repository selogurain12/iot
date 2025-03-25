import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectLabel, SelectGroup, SelectValue } from "../ui/select";
import axios from "axios";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { UserDto } from "../dtos/user.dto";
import { useAuth } from "../../context/authContext";
import { CardDto } from "../dtos/card.dto";

interface AddCardProps {
    closeModal: () => void;
    refreshData: () => Promise<void>;
}

export function AddCard({ closeModal, refreshData }: AddCardProps) {
    const [data, setData] = useState<UserDto[]>([]);
    const [card, setCard] = useState<CardDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [selectedCard, setSelectedCard] = useState<string>("");
    const { token } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<UserDto[]>(
                    `http://10.33.76.16:3000/users`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                const cardData = await axios.get<CardDto[]>(
                    `http://10.33.76.16:3000/rfid`
                );
                setData(response.data);
                setCard(cardData.data)
            } catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);
    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        try {
            // Assurez-vous de soumettre l'ID de l'utilisateur sélectionné ici
            await axios.post(`http://10.33.76.16:3000/rfid`, {
                        card_id: selectedCard,
                        user_id: selectedUser
                    });
            toast.success("Carte RFID ajoutée avec succès");
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
                            <p>Chargement des cartes...</p>
                        ) : (
                        <div className="space-y-1">
                            <Select value={selectedCard} onValueChange={setSelectedCard}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sélectionner une carte" /> {/* Affiche la valeur sélectionnée ici */}
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Choisir une carte</SelectLabel>
                                        {card.map((card) => (
                                            <SelectItem key={card.card_id} value={card.card_id}>
                                                {card.card_id}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            </div>
                        )}
                        {loading ? (
                            <p>Chargement des utilisateurs...</p>
                        ) : (
                        <div className="space-y-1">
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
