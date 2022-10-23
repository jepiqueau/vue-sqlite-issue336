import axios from 'axios';
import { PropsSqlite, DataType } from '../../interfaces/interfaces';
import { getDatabaseConnection } from '@/services/database/databaseConnection.service';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';

export const getDataFromUrl = async (pSqlite: PropsSqlite, url: string): Promise<DataType[]> => {
    if (navigator.onLine) {
        let dbRW: SQLiteDBConnection = {} as SQLiteDBConnection; 
        try {
            const apiRes = await axios.get(url);
    
            if (apiRes?.data.length !== 0) {
                dbRW = await getDatabaseConnection(pSqlite, 'mydb')
                await dbRW.open()
                const dataToInsert = [] as any[];
                apiRes.data.data.forEach(async (el: any) => {
                    dataToInsert.push([el["ID Nation"], el["Nation"], el["ID Year"],el["Population"]]);
                });
                    const dataPlaceholders = dataToInsert.map(() => '(?, ?, ?, ?)').join(',');
                    const query = `
                    INSERT INTO nations (nation_id, nation, year_id, population) 
                    VALUES ${dataPlaceholders} 
                    ON CONFLICT (nation_id,year_id) DO 
                    UPDATE SET nation=excluded.nation, population=excluded.population;
                    `
                    const retRun = await dbRW.run(query, dataToInsert.flatMap((el) => el));
                    if(retRun && retRun.changes && retRun.changes.changes && retRun.changes.changes < 0) {
                        return Promise.reject('Run returned changes < 0');
                    }
        
            } else {
                return Promise.reject('No data returned from given Url');
            }
            

        } catch (err: any) {
            const msg = err.message ? err.message : err;
            return Promise.reject(msg);
        } finally {
            if(dbRW && (await dbRW.isDBOpen())) {
                await dbRW.close();
            }
        }
    }
    let dbRO: SQLiteDBConnection = {} as SQLiteDBConnection; 
    try {
        dbRO = await getDatabaseConnection(pSqlite, 'mydb', true, false, true);
        await dbRO.open()

        const sqliteRes = await dbRO.query(`SELECT * FROM nations;`)
        
      
        const dataToReturn = [] as DataType[]
        sqliteRes?.values?.forEach((el: any) => {
          const record: DataType = {
            nationId: el.nation_id,
            nation: el.nation,
            yearId: el.year_id,
            population: el.population,
          }
          dataToReturn.push(record)
        });   
        return dataToReturn;
          
    } catch (err: any) {
        const msg = err.message ? err.message : err;
        return Promise.reject(msg);
    } finally {
        await dbRO.close()
    }
    
};
