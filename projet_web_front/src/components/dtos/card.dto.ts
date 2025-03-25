export interface CardDto {
    id: string;
    card_id: string;
    is_active: boolean;
    user_id: string;
    created_at: Date;
    
    [key: string]: string | number | Date | undefined | boolean;
}
