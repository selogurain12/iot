export interface AccessLog {
    id: string;
    access_type: string;
    identifier: string;
    success: boolean;
    created_at: string;
    name?: string;
    firstname?: string;
    email?: string;
    user_id: string;

    [key: string]: string | number | Date | undefined | boolean;
  }