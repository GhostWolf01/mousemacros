<script setup></script>
<template>
  <div class="loading">
    <div class="loading__icon"></div>
  </div>
</template>
<style>
.loading {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading__icon {
  width: 80px;
  height: 80px;
  border: 10px solid #f6f6f6;
  border-bottom-color: transparent;
  border-radius: 100%;
  animation: loadingAnim 2s 0s linear infinite;
}

@keyframes loadingAnim {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
