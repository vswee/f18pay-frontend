<template>
  <div id="app">

    <template v-if="$route.name === 'InvoiceAPI'">
      <InvoiceAPIContainer />
    </template>
    <template v-else>
      <AppContainer />
    </template>

  </div>
</template>

<script>
import AppContainer from './components/AppContainer.vue'
import InvoiceAPIContainer from './components/InvoiceAPIContainer.vue'
export default {
  name: 'App',
  components: {
    AppContainer,
    InvoiceAPIContainer,
  }
}
</script>
<style lang="scss">
body{
  font-family: "Rubik", "Helvetica Neue", "Helvetica", "Arial", "Font Awesome 5 Brands", "Font Awesome 5", sans-serif;
  margin: 0;
  padding: 0;
}
</style>
<style lang="css">
@import "./assets/css/fonts.css";
</style>