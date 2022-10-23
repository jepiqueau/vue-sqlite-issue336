<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Blank</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Blank</ion-title>
        </ion-toolbar>
      </ion-header>
    
      <div id="container">
        <p v-if="loading">Loading posts...</p>
        <div v-if="errMess.length > 0">
            <p>{{errMess}}</p>
        </div>
        <div v-if="someData">
          <div v-for="(data, index) in someData" :key="index">
            <p>{{ data.nationId }},{{ data.nation }},{{ data.yearId }},{{ data.population }}</p>
          </div>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { defineComponent, onMounted, inject } from 'vue';
import { getDatabaseConnection, saveToStore } from '@/services/database/databaseConnection.service';
import { PropsSqlite } from '@/interfaces/interfaces';
import { storeToRefs } from 'pinia'
import { useDataStore } from '@/stores/data.store'
import { useState } from '@/composables/state';

export default defineComponent({
  name: 'HomePage',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar
  },
  setup() {
    const url = 'https://datausa.io/api/data?drilldowns=Nation&measures=Population';
    const [errMess, setErrMess] = useState("");
    // Inject the singleton pSqlite in the component
    const pSqlite: PropsSqlite = inject("propsSqlite", {} as PropsSqlite);
    // Initialize the pinia store
    const dataStore = useDataStore();
    const {someData, loading, error}  = storeToRefs(dataStore);

    // Create the Database Schema
    const createDBSchema = async (): Promise<boolean> => {
      try {
        const dbRW = await getDatabaseConnection(pSqlite, 'mydb', false, true, true);
        await dbRW.open();
        const schema = `
          CREATE TABLE IF NOT EXISTS nations (
          nation_id TEXT NOT NULL,
          nation TEXT NOT NULL,
          year_id INTEGER NOT NULL,
          population INTEGER,
          UNIQUE(nation_id,year_id)
          );
          CREATE INDEX IF NOT EXISTS nations_index_nation_year_ids ON nations (nation_id,year_id);
        `
        const retSchema: any = await dbRW.execute(schema);
        if (retSchema.changes.changes < 0) {
            setErrMess(`Create schema changes < 0`);
            return false;
        }
        return true;
      } catch (err: any) {
        setErrMess(err.message ? `${err.message}` : err);
        return false;
      }
    }
    onMounted(async () => {
      try {
        // Create the database schema
        const retSchema: boolean = await createDBSchema();
        if (retSchema) {
          // save the database to jeepSqliteStore if web platform
          await saveToStore(pSqlite,'mydb');
          // perform a first run
          await dataStore.setSomeData(pSqlite, url);
          console.log(`first run someData: ${JSON.stringify(someData.value)} `)
          if(error.value.length > 0) {
            setErrMess(error.value);
          }
          // perform a second run
          await dataStore.setSomeData(pSqlite, url);
          console.log(`second run someData: ${JSON.stringify(someData.value)} `)
          if(error.value.length > 0) {
            setErrMess(error.value);
          }
        }

      } catch (err: any) {
        setErrMess(err.message ? `${err.message}` : err);
      }
    });
    return {pSqlite, errMess, loading, someData};
  }
});
</script>

<style scoped>
#container {
  text-align: center;
  
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  
  color: #b1b0b0;
  
  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>
