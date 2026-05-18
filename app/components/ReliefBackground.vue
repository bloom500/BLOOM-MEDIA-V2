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
  /* svh = stable; consistent with the global iOS bar-collapse fix. */
  min-height: 100svh;
}
</style>
