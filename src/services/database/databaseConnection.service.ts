import { PropsSqlite } from '../../interfaces/interfaces';

import { SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';


export const saveToStore = async (pSqlite: PropsSqlite, dbName: string) => {
    const keys = Object.keys(pSqlite);
    if (!keys.includes("sqlite") || !keys.includes("platform")) {
        return Promise.reject("No sqlite && no platform given");
    }
    const platform = pSqlite.platform;
    const sqlite = pSqlite.sqlite;
    if (platform === 'web') {
        try {
            await sqlite.saveToStore(dbName)
            return;
        } catch(err: any) {
            const msg: string = err.message ? err.message : err;
            return Promise.reject(msg);
        }
    }
   return;
}
export const getDatabaseConnection = async (pSqlite: PropsSqlite, dbName: string, readonly = false, toDelete = false, toCheck = false) => {
    const keys = Object.keys(pSqlite);
    if (!keys.includes("sqlite") || !keys.includes("platform")) {
        return Promise.reject("No sqlite && no platform given");
    }
    const sqlite: SQLiteConnection = pSqlite.sqlite;
    let db: SQLiteDBConnection
    let isCheck = true;
    try {
        if (toCheck) {
            const ret = await sqlite.checkConnectionsConsistency();
            isCheck = ret.result ? ret.result: false;
        }
        const isConn = (await sqlite.isConnection(dbName, readonly)).result;
        if (isCheck && isConn) {
            db = await sqlite.retrieveConnection(dbName, readonly);
        } else {
            db = await sqlite.createConnection(dbName, false, 'no-encryption', 1, readonly);
        }
        if (toDelete) {
            await deleteDatabase(db);
        }
        return db
    } catch(err: any) {
        const msg: string = err.message ? err.message : err;
        return Promise.reject(msg);
    }
};
const deleteDatabase = async (db: SQLiteDBConnection) => {
    try {
        const ret: any = await db.isExists();
        if(ret.result) {
          const dbName = db.getConnectionDBName();
          console.log("$$$ database " + dbName + " before delete");
          await db.delete();
          console.log("$$$ database " + dbName + " after delete " + ret.result);
          return Promise.resolve();
        } else {
          return Promise.resolve();
        }
    } catch (err: any) {
        const msg: string = err.message ? err.message : err;
        return Promise.reject(msg);
    }
}
