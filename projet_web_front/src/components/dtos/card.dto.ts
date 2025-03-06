export interface CardDto {
    id: string;
    name: string;
    mail: string;
    pin_code: string;
    information: string;
    date: Date;
    
    [key: string]: string | number | Date | undefined;
}
