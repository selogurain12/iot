import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectLabel, SelectGroup, SelectValue } from "../ui/select";
import axios from "axios";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { CardDto } from "../dtos/card.dto";

interface AssociateCardProps {
    closeModal: () => void;
    refreshData: () => Promise<void>;
    id: string; // ID de l'utilisateur déjà connu
}

export function AssociateCard({ closeModal, id, refreshData }: AssociateCardProps) {
    const [cards, setCards] = useState<CardDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState<CardDto | undefined>(undefined);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const cardData = await axios.get<CardDto[]>(`http://localhost:3000/rfid`);
                const unassignedCards = cardData.data.filter(card => card.user_id === null);
                setCards(unassignedCards);
            } catch (error) {
                console.error("Erreur lors de la récupération des cartes :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        try {
            if (selectedCard) {
                await axios.put(`http://localhost:3000/rfid/${selectedCard.id}`, {
                    card_id: selectedCard.card_id,
                    user_id: id // Utilisation de l'ID de l'utilisateur déjà connu
                });
                toast.success("Carte RFID associée avec succès !");
                refreshData();
                closeModal();
            } else {
                toast.error("Veuillez sélectionner une carte.");
            }
        } catch (error) {
            console.error("Erreur lors de l'association de la carte :", error);
            toast.error("Échec de l'association de la carte.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg w-[400px]">
                <Card>
                    <CardHeader>
                        <CardTitle>Associer une carte RFID</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {loading ? (
                            <p>Chargement des cartes...</p>
                        ) : (
                            <div className="space-y-1">
                                <Select value={selectedCard?.card_id} onValueChange={(value) => {
                                    const cardSelected = cards.find(c => c.card_id === value);
                                    setSelectedCard(cardSelected);
                                }}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Sélectionner une carte" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Choisir une carte</SelectLabel>
                                            {cards.map((card) => (
                                                <SelectItem key={card.card_id} value={card.card_id}>
                                                    {card.card_id}
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
