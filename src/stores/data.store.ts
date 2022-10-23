import { defineStore } from 'pinia'
import { getDataFromUrl} from '@/services/data/getDataFromUrl.service';
import { PropsSqlite, DataType } from '@/interfaces/interfaces';

export const useDataStore = defineStore('DataStore', {
  state: () => ({
      someData: [] as DataType[],
      loading: false,
      error: ""
  }),

  actions: {
    async setSomeData(pSqlite: PropsSqlite, url: string) {
      try {
        this.loading = true;
        this.someData = await getDataFromUrl(pSqlite, url);
      } catch(err: any) {
        this.error = err.message ? err.message : err;
      } finally {
        this.loading = false;
      }
    }
  },

  getters: {
    getTheData: state => state.someData
  }
})