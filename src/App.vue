<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent, getCurrentInstance, provide, onMounted } from 'vue';
import { PropsSqlite } from '@/interfaces/interfaces';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet
  },
  setup() {
    const app = getCurrentInstance();
    if (app != null) {
    // get the singleton pSqlite object
    const pSqlite: PropsSqlite = app.appContext.config.globalProperties.$pSqlite;
    // Provide the singleton pSqlite using the composition API
    // to be injected in others components
    provide("propsSqlite", pSqlite);
    return {pSqlite};
    } else {
      throw Error("app is null");
    }
  }
});
</script>