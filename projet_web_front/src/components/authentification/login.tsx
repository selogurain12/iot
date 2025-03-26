import { Card } from "../ui/cards/card";
import { CardHeader } from "../ui/cards/card-header";
import { CardTitle } from "../ui/cards/card-title";
import { CardContent } from "../ui/cards/card-content";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { CardFooter } from "../ui/cards/card-footer";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../../context/authContext";

export function Login() {
  const naviage = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
      e.preventDefault();

      try {
          const response = await axios.post("http://localhost:3000/users/login", {
              email,
              password,
          });
          console.log(response.data.user)
          signIn(response.data.user, response.data.token, 3600)
          toast.success("Vous êtes bien connecté")
          naviage("/userlist")
      } catch (error) {
          console.error("Erreur lors de l'envoi des données:", error);
      }
  };
    return(
        <Card>
          <CardHeader>
            <CardTitle>Se connecter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/userlist">
            <Button onClick={handleSubmit}>Se connecter</Button>
            </Link>
          </CardFooter>
        </Card>
    )
}