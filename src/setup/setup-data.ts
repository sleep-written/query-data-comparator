export interface SetupData {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;

    primaryKey: string;
    queryFetch: string;
    queryTransact: string;
}