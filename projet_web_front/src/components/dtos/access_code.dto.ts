export interface AccessCodeDto {
    id: string;            // UUID
    code: string;          // Le code PIN
    user_id: string | null; // UUID ou null si l'utilisateur n'est pas associé
    is_active: boolean;    // Statut actif/inactif
    created_at: string;    // Date de création en ISO 8601 (format string)
  
    [key: string]: string | number | Date | undefined | boolean | null;
}
