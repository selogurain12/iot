import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectLabel, SelectGroup, SelectValue } from "../ui/select";
import axios from "axios";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { UserDto } from "../dtos/user.dto";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useAuth } from "../../context/authContext";
import { CardDto } from "../dtos/card.dto";

interface UpdateCardProps {
    closeModal: () => void;
    refreshData: () => Promise<void>;
    id: string;
}

export function UpdateCard({ closeModal, id, refreshData }: UpdateCardProps) {
    const [data, setData] = useState<UserDto[]>([]);
    const [card, setCard] = useState<CardDto>();
    const [card_id, setcard_id] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<string>("");
    const { token } = useAuth();
     useEffect(() => {
            const fetchData = async () => {
                try {
                    const response = await axios.get<CardDto>(
                        `http://10.33.76.16:3000/rfid/card/${id}`
                    );
                    setCard(response.data);
                } catch (error) {
                    console.error("Erreur lors de la récupération des utilisateurs :", error);
                } finally {
                    setLoading(false);
                }
            };
        
            fetchData();
        }, [id]);
         useEffect(() => {
                if (card) {
                    setcard_id(card.card_id);
                    setSelectedUser(card.user_id);
                }
            }, [card]);
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
                setData(response.data);
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
            await axios.put(`http://10.33.76.16:3000/rfid/${card?.id}`, {
                        card_id,
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
                        <CardTitle>Modifier une carte RFID</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                    <div className="space-y-1">
                            <Label htmlFor="card_id">Id de la carte</Label>
                            <Input
                                id="card_id"
                                value={card_id}
                                onChange={(e) => setcard_id(e.target.value)}
                            />
                        </div>
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
