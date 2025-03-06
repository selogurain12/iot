import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { UserDto } from "../dtos/user.dto";

interface UpdateUserModalProps {
    closeModal: () => void;
    id: string;
}

export function UpdateUserModal({ closeModal, id }: UpdateUserModalProps) {
    const navigate = useNavigate();
    const [firstname, setfirstname] = useState("");
    const [name, setname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [data, setData] = useState<UserDto>();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<UserDto>(
                    `http://localhost:3001/users/${id}`
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
            setfirstname(data.firstname);
            setname(data.name);
            setEmail(data.email);
            setPassword(data.password);
        }
    }, [data]); // This ensures state updates only when `data` changes
    

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        const created_at = new Date().toLocaleString("fr-FR", {
            timeZone: "Europe/Paris",
            hour12: false,
        });
        
        try {
            await axios.post("http://localhost:3001/users", {
                firstname,
                name,
                email,
                password,
                created_at,
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
                            <Label htmlFor="firstname">Prénom</Label>
                            <Input
                                id="firstname"
                                value={firstname}
                                onChange={(e) => setfirstname(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="name">Nom</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setname(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
