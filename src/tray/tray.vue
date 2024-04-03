<script setup lang="ts">
import { listen } from "@tauri-apps/api/event";
import { ref, watch } from "vue";
import { config } from "./tray";
import { ITimers, ITransportConfig } from "../types/tray";
import { appWindow } from "@tauri-apps/api/window";

appWindow.onCloseRequested((event) => {
  event.preventDefault();
  appWindow.minimize();
});

const show = ref({
  activeScript: true,
  activeVariant: true,
  sensitivity: true,
});

const timers: ITimers = {
  activeScript: undefined,
  activeVariant: undefined,
  sensitivity: undefined,
  actions: {
    activeScript() {
      clearTimeout(timers.activeScript);
      timers.activeScript = setTimeout(() => {
        show.value.activeScript = false;
      }, 5000);
      show.value.activeScript = true;
    },
    activeVariant() {
      clearTimeout(timers.activeVariant);
      timers.activeVariant = setTimeout(() => {
        show.value.activeVariant = false;
      }, 3000);
      show.value.activeVariant = true;
      timers.actions.activeScript();
    },
    sensitivity() {
      clearTimeout(timers.sensitivity);
      timers.sensitivity = setTimeout(() => {
        show.value.sensitivity = false;
      }, 3000);
      show.value.sensitivity = true;
      timers.actions.activeScript();
    },
  },
};

async function main() {
  if (import.meta.env.PROD) {
    window.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
    window.addEventListener("focus", (event) => {
      event.preventDefault();
    });
  }

  const unlisten = await listen<ITransportConfig>("changeConfig", (event) => {
    config.activeScript.value = event.payload.activeScript;
    config.showTray.value = event.payload.showTray;
    config.config.activeVariant.value = event.payload.config.activeVariant;
    config.config.main.value = event.payload.config.main;
  });
}

watch(config.activeScript, () => timers.actions.activeScript(), {
  immediate: true,
});

watch(config.config.activeVariant, () => timers.actions.activeVariant(), {
  immediate: true,
});

watch(
  () => config.config.main.value.sensitivity,
  () => timers.actions.sensitivity(),
  {
    immediate: true,
  }
);

main();
</script>

<template>
  <div class="app">
    <h1 class="main-text" :class="{ 'main-text--hidden': !show.activeScript }">
      {{ config.activeScript.value ? "Active" : "Inactive" }}
    </h1>
    <h2 v-if="show.activeVariant" class="text" :class="{ 'main-text--hidden': !show.activeScript }">
      Variant active: {{ config.config.activeVariant }}
    </h2>
    <h2 v-if="show.sensitivity" class="text" :class="{ 'main-text--hidden': !show.activeScript }">
      Sensitivity: {{ config.config.main.value.sensitivity }}
    </h2>
  </div>
</template>

<style>
.app {
  width: max-content;
  height: max-content;
  font-size: 10px;
  padding: 0 0 0 5px;
}
.main-text {
  color: rgba(229, 115, 115, 1);
}
.main-text--hidden {
  color: rgba(229, 115, 115, 0.6);
}

.text {
  color: rgba(229, 115, 115, 1);
}

/* .text--hidden {
  color: rgba(229, 115, 115, 0);
} */
</style>
