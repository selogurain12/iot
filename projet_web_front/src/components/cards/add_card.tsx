import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectLabel, SelectGroup, SelectValue } from "../ui/select";
import axios from "axios";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { UserDto } from "../dtos/user.dto";
import { useAuth } from "../../context/authContext";
import { CardDto } from "../dtos/card.dto";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface AddCardProps {
    closeModal: () => void;
    refreshData: () => Promise<void>;
}

export function AddCard({ closeModal, refreshData }: AddCardProps) {
    const [data, setData] = useState<UserDto[]>([]);
    const [card, setCard] = useState<CardDto[]>([]);
    const [pin, setpin] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [selectedCard, setSelectedCard] = useState<CardDto | undefined>(undefined); // Type modifié ici
    const { token } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<UserDto[]>(
                    `http://localhost:3000/users`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                const cardData = await axios.get<CardDto[]>(
                    `http://localhost:3000/rfid`
                );
                const unassignedCards = cardData.data.filter(card => card.user_id === null);
                setData(response.data);
                setCard(unassignedCards);
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
    
        if (!pin.trim()) { // Vérifie si le PIN est vide ou contient uniquement des espaces
            toast.error("Veuillez entrer un code PIN.");
            return;
        }
    
        try {
            if (selectedCard) { // Vérifie si une carte est sélectionnée
                await axios.put(`http://localhost:3000/rfid/${selectedCard.id}`, {
                    card_id: selectedCard.card_id,
                    user_id: selectedUser
                });
    
                await axios.post(`http://localhost:3000/access`, {
                    createCode: pin,
                    user_id: selectedUser
                });
    
                toast.success("Carte RFID ajoutée et code PIN créé avec succès");
                refreshData();
                closeModal();
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi des données:", error);
            toast.error("Une erreur s'est produite lors de l'ajout de la carte.");
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
                                <Select value={selectedCard?.card_id} onValueChange={(value) => {
                                    // Trouver la carte correspondant à l'ID sélectionné
                                    const cardSelected = card.find(c => c.card_id === value);
                                    setSelectedCard(cardSelected); // Mettre à jour l'état avec l'objet carte
                                }}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Sélectionner une carte" />
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
                        {selectedUser && (
                            <div className="space-y-1">
                                <Label htmlFor="pin">Code PIN</Label>
                                <Input
                                    id="pin"
                                    value={pin}
                                    onChange={(e) => setpin(e.target.value)}
                                />
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
