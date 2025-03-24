import axios from "axios";
import { UserDto } from "../dtos/user.dto";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface AddCardProps {
    id: string;
    closeModal: () => void;
    refreshData: () => Promise<void>;
}

export function UpdatePIN({ id, closeModal, refreshData }: AddCardProps) {
    const [data, setData] = useState<UserDto>();
    const [loading, setLoading] = useState(true);
    const [pin, setPin] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
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

    useEffect(() => {
        if (data) {
            setPin(data.password);
        }
    }, [data]); 

    const navigate = useNavigate();

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        try {
            // Assurez-vous de soumettre l'ID de l'utilisateur sélectionné ici
            await axios.post("http://localhost:3000/rfid");
            toast.success("Code PIN modifié avec succès");
            navigate("/userlist");
            refreshData();
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
                        <CardTitle>Modifier le code PIN</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="space-y-1">
                            <Label htmlFor="pin">Prénom</Label>
                            <Input
                                id="pin"
                                value={pin}
                                type="password"
                                onChange={(e) => setPin(e.target.value)}
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