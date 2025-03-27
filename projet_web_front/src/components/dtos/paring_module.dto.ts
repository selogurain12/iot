export interface PairingDto {
    pairing_id: string;
    module_in_hostname: string;
    module_out_hostname: string;
    
    [key: string]: string | number | Date | undefined | boolean;
}
