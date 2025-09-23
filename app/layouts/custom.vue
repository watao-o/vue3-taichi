<template>
  <v-app>
    <v-main>
      <v-container>
        <header style="background: #1976d2; color: #fff; padding: 1rem">
          <h2>カスタムレイアウト</h2>
        </header>
        <slot />
        <footer style="background: #eee; padding: 1rem; text-align: center">
          &copy; 2025 Custom Layout
        </footer>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
// 必要に応じてVuetifyや他のプラグインをimportしてください
</script>
