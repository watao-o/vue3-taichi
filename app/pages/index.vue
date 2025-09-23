<template>
  <NuxtLayout name="custom">
    <v-app>
      <MedicalRecords />
    </v-app>
  </NuxtLayout>
</template>

<script setup lang="ts">
import MedicalRecords from "~/components/MedicalRecords.vue";
import { ref } from "vue";
</script>
