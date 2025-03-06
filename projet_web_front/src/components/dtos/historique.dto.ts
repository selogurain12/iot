export interface HistoriqueDto {
    id: string;
    email: string;
    date: string;
    hours: string;
    result: string;

    // Ajouter une signature d'index pour le rendre compatible avec react-table
    [key: string]: string | number | Date | undefined;
}
