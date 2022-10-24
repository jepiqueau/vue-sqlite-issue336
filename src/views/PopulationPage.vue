<template>
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-back-button default-href="/home"></ion-back-button>
            </ion-buttons>
            <ion-title>Population</ion-title>
        </ion-toolbar>
      </ion-header>
      
      <ion-content :fullscreen="true">
        <ion-header collapse="condense">
          <ion-toolbar>
            <ion-title size="large">Population</ion-title>
          </ion-toolbar>
        </ion-header>
      
        <div id="container">
          <p v-if="loading">Loading population...</p>
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
  import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton } from '@ionic/vue';
  import { defineComponent, onMounted, inject, onBeforeUnmount } from 'vue';
  import { createDBSchema, saveToStore, closeDatabaseConnection, delay } from '@/services/database/databaseConnection.service';
  import { PropsSqlite } from '@/interfaces/interfaces';
  import { storeToRefs } from 'pinia'
  import { useDataStore } from '@/stores/data.store'
  import { useState } from '@/composables/state';
  
  export default defineComponent({
    name: 'PopulationPage',
    components: {
      IonContent,
      IonHeader,
      IonPage,
      IonTitle,
      IonToolbar,
      IonButtons,
      IonBackButton
    },
    setup() {
      const url = 'https://datausa.io/api/data?drilldowns=Nation&measures=Population';
      const [errMess, setErrMess] = useState("");
      // Initialize the pinia store
      const dataStore = useDataStore();
      const {someData, loading, error}  = storeToRefs(dataStore);
      // Inject the singleton pSqlite in the component
      const pSqlite: PropsSqlite = inject("propsSqlite", {} as PropsSqlite);

      // Create the Database Schema
      onMounted(async () => {
        // a delay has been implemented for web in development
        // to let the onBeforeUnmount completes before the refresh unMounted 
        // process start
        if(pSqlite.platform === 'web') {
            await delay();
        }
        try {
            // Create the database schema
            await createDBSchema(pSqlite, 'mydb');
            // save the database to jeepSqliteStore if web platform
            await saveToStore(pSqlite, 'mydb');
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
  
        } catch (err: any) {
          setErrMess(err.message ? `${err.message}` : err);
        }
      });
      onBeforeUnmount(async() => {
        try {
          await closeDatabaseConnection(pSqlite, 'mydb');
        } catch (err: any) {
          setErrMess(err.message ? `${err.message}` : err);
        }
      });
      return { errMess, loading, someData};
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
  