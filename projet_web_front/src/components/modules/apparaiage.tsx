import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../ui/button"; // Assurez-vous d'avoir un composant Button ShadCN
import { ModuleDto } from "../dtos/module.dto";
import { toast } from "sonner";

export function PairingPage() {
  const [inModules, setInModules] = useState<ModuleDto[]>([]);
  const [outModules, setOutModules] = useState<ModuleDto[]>([]);
  const [selectedIn, setSelectedIn] = useState<ModuleDto | null>(null);
  const [selectedOut, setSelectedOut] = useState<ModuleDto | null>(null);
  const [isPairingVisible, setIsPairingVisible] = useState(false);

  // Fonction pour récupérer les modules depuis l'API
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await axios.get<ModuleDto[]>('http://localhost:3000/module');
        const inModulesData = response.data.filter((module) => module.type === 'IN');
        const outModulesData = response.data.filter((module) => module.type === 'OUT');

        setInModules(inModulesData);
        setOutModules(outModulesData);
      } catch (error) {
        console.error("Erreur lors de la récupération des modules :", error);
      }
    };

    fetchModules();
  }, []);

  // Fonction pour gérer la sélection et désélection des éléments IN
  const handleInSelect = (module: ModuleDto) => {
    setSelectedIn((prev) => (prev?.id === module.id ? null : module));
  };

  // Fonction pour gérer la sélection et désélection des éléments OUT
  const handleOutSelect = (module: ModuleDto) => {
    setSelectedOut((prev) => (prev?.id === module.id ? null : module));
  };

  // Vérifier si les éléments sont sélectionnés des deux côtés
  useEffect(() => {
    if (selectedIn && selectedOut) {
      setIsPairingVisible(true);
    } else {
      setIsPairingVisible(false);
    }
  }, [selectedIn, selectedOut]);

  // Fonction pour appairer les modules sélectionnés
  const handlePairing = async () => {
    if (selectedIn && selectedOut) {
      console.log("Appairer:", selectedIn.hostname, selectedOut.hostname);
      // Ici, tu peux envoyer la requête pour appairer les modules dans ta base de données
      // Par exemple, une requête PATCH ou POST selon l'API que tu utilises.
    }
    try {
            await axios.put(`http://localhost:3000/module`, {
                moduleInId: selectedIn?.id,
                moduleOutId: selectedOut?.id
            });

            toast.success("Les modules ont été appairés avec succès");
    } catch (error) {
        console.error("Erreur lors de l'envoi des données:", error);
        toast.error("Une erreur s'est produite lors de l'appairage");
    }
  };

  return (
    <div className="p-4">
      {/* Conteneur des tableaux IN et OUT */}
      <div className="flex space-x-4 mb-6">
        {/* Tableau IN */}
        <div className="w-1/2">
          <h2 className="text-xl mb-4">Modules IN</h2>
          <ul className="space-y-2">
            {inModules.map((module) => (
              <li
                key={module.id}
                className={`p-2 border ${selectedIn?.id === module.id ? "bg-blue-200" : "bg-gray-100"}`}
                onClick={() => handleInSelect(module)}
              >
                {module.hostname}
              </li>
            ))}
          </ul>
        </div>

        {/* Tableau OUT */}
        <div className="w-1/2">
          <h2 className="text-xl mb-4">Modules OUT</h2>
          <ul className="space-y-2">
            {outModules.map((module) => (
              <li
                key={module.id}
                className={`p-2 border ${selectedOut?.id === module.id ? "bg-blue-200" : "bg-gray-100"}`}
                onClick={() => handleOutSelect(module)}
              >
                {module.hostname}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bouton Appairer sous les tableaux */}
      {isPairingVisible && (
        <div className="w-full flex justify-center mt-6">
          <Button onClick={handlePairing} className="bg-green-500 text-white">
            Appairer
          </Button>
        </div>
      )}
    </div>
  );
}
