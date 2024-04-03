<script setup lang="ts">
// import App from "./app.vue";
import Loading from "./components/Loading.vue";
import { defineAsyncComponent } from "vue";
const App = defineAsyncComponent(() => import("./app.vue"));
</script>

<template>
  <Suspense>
    <App />
    <template #fallback>
      <Loading />
    </template>
  </Suspense>
</template>
