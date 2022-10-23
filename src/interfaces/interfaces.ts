import { SQLiteConnection } from '@capacitor-community/sqlite';

export interface PropsSqlite {
    sqlite: SQLiteConnection;
    platform: string;
}

export interface DataType {
    nationId: string;
    nation: string;
    yearId: number;
    population: number;
}
  