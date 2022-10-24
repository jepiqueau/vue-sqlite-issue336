<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Test Issue#336</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Test Issue#336</ion-title>
        </ion-toolbar>
      </ion-header>
    
      <IonList>
        <IonItem>
          <ion-button  @click="() => router.push('/population')">Population</ion-button>
        </IonItem>
      </IonList>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonButton } from '@ionic/vue';
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'HomePage',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonButton
  },
  setup() {
    const router = useRouter();
    return { router };
  }
});
</script>

<style scoped>

</style>
