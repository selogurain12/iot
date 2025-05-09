import { useState } from "react";
import axios from "axios";
import { Card } from "../ui/cards/card";
import { CardHeader } from "../ui/cards/card-header";
import { CardTitle } from "../ui/cards/card-title";
import { CardContent } from "../ui/cards/card-content";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { CardFooter } from "../ui/cards/card-footer";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

export function Register() {
  const navigate = useNavigate();
  const [firstname, setfirstname] = useState("");
  const [name, setname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useAuth();

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
      e.preventDefault();
      const created_at = new Date().toLocaleString("fr-FR", {
        timeZone: "Europe/Paris",
        hour12: false,
    });

      try {
          const response = await axios.post("http://localhost:3000/users/register", {
              firstname,
              name,
              email,
              password,
              created_at,
          });
          const { user, token } = response.data;
          signIn(user, token, 3600);
          toast.success("Vous êtes bien inscrit");
          if (user.role === "admin") {
            navigate("/userlist");  // Rediriger vers la page des utilisateurs pour les admins
        } else if (user.role === "user") {
            navigate("/historic");  // Rediriger vers l'historique pour les utilisateurs
        } else {
            navigate("/");  // Si aucun rôle, rediriger vers la page d'accueil (ou une autre page par défaut)
        }
      } catch (error) {
          console.error("Erreur lors de l'envoi des données:", error);
      }
  };

  return (
      <Card>
          <CardHeader>
              <CardTitle>S'inscrire</CardTitle>
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
          <CardFooter>
              <Button onClick={handleSubmit}>S'inscrire</Button>
          </CardFooter>
      </Card>
  );
}
