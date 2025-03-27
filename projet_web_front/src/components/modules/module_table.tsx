import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "../ui/tables/data-table";
import { ModuleColumn } from "./column_module";
import { ModuleDto } from "../dtos/module.dto";
import { Button } from "../ui/button";
import { PairingPage } from "./apparaiage";

export function ModuleTable() {
  const [data, setData] = useState<{ out: string, in: string }[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string | undefined>("");
  const [isModalAppairOpen, setIsModalAppairOpen] = useState(false);

  // Fonction pour récupérer et traiter les données
  const refreshData = useCallback(async () => {
    try {
      const response = await axios.get<ModuleDto[]>(
        `http://localhost:3000/module?page=${page}&limit=${itemsPerPage}&search=${search}`
      );

      if (!response.data) return;

      // Filtrer les modules IN et OUT
      const outModules = response.data.filter(m => m.type === "OUT");
      const inModules = response.data.filter(m => m.type === "IN");

      // Associer les paires IN/OUT
      const pairs = outModules.map(out => {
        const matchingIn = inModules.find(inp => inp.hostname === out.pair_hostname);
        return {
          out: out.hostname,
          in: matchingIn ? matchingIn.hostname : "Aucune correspondance"
        };
      });

      setData(pairs); // Mettre à jour l'état avec les paires traitées

    } catch (error) {
      console.error("Erreur lors de la récupération des modules :", error);
    }
  }, [page, itemsPerPage, search]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const openCreateModal = () => {
    setIsModalAppairOpen(true);
  };

  const closeCreateModal = () => {
    setIsModalAppairOpen(false);
  };

  return (
    <div>
      <div className="w-full py-5 justify-items-end grid pr-3">
        <Button variant="outline" onClick={openCreateModal}>Appairer des modules</Button>
      </div>
      
      <DataTable
        data={data} // Utilisation de `data` mis à jour
        columns={ModuleColumn()}
        total={data.length}
        defaultItemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        setPage={setPage}
        setSearch={setSearch}
      />

      {/* Modal */}
      {isModalAppairOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-2/3">
            <PairingPage closeModal={closeCreateModal} refreshData={refreshData} />
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={closeCreateModal}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
