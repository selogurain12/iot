import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { DatePicker } from "../ui/date-picker";
import { CardDto } from "../dtos/card.dto";
import { Textarea } from "../ui/textarea";

interface UpdateCardProps {
    closeModal: () => void;
    id: string;
}

export function UpdateCard({ closeModal, id }: UpdateCardProps) {
    const navigate = useNavigate();
    const [date, setDate] = useState<Date>();
    const [name, setname] = useState("");
    const [information, setInformation] = useState("");
    const [data, setData] = useState<CardDto>();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<CardDto>(
                    `http://localhost:3000/users/${id}`
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
    
    // New useEffect to update state when data is fetched
    useEffect(() => {
        if (data) {
            setDate(data.date ? new Date(data.date) : undefined);
            setname(data.name);
            setInformation(data.information);
        }
    }, [data]); // This ensures state updates only when `data` changes
    

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        
        try {
            await axios.post("http://localhost:3000/users", {
                date,
                name,
                information,
            });

            toast.success("L'utilisateur a bien été créé");
            navigate("/userlist");
            closeModal();
        } catch (error) {
            console.error("Erreur lors de l'envoi des données:", error);
        }
    };

    if (loading) return <p>Chargement...</p>;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg w-[400px]">
                <Card>
                    <CardHeader>
                        <CardTitle>Modifier un utilisateur</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="space-y-1">
                            <Label htmlFor="name">Nom</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setname(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="date">Date</Label>
                            <DatePicker
                                id="date"
                                value={date instanceof Date ? date.toISOString().split("T")[0] : ""}
                                onChange={(e) => setDate(new Date(e.target.value))}
                                changeValue={(newValue: string) => setDate(new Date(newValue))}
                                disabledRange={undefined}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="information">Information</Label>
                            <Textarea
                                id="information"
                                value={information}
                                onChange={(e) => setInformation(e.target.value)}
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
