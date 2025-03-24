export interface UserDto {
    id: string;
    firstname: string;
    name: string;
    email: string;
    created_at: string;
    password: string;
    role?: string;

    // Ajouter une signature d'index pour le rendre compatible avec react-table
    [key: string]: string | number | undefined;
}
