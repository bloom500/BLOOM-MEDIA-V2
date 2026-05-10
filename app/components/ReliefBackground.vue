<template>
  <div class="relief-content">
    <slot />
  </div>
</template>

<script setup>
</script>

<style scoped>
.relief-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}
</style>
