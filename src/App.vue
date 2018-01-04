<template>
  <div id="app">
    <h1>Vuetodon</h1>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
body {
  background: #111;
}

a:link {
  color: #ccc;
  text-decoration: none;
}

a:visited {
  color: #999;
}

a:hover, a:active {
  color: #fff;
  text-decoration: underline;
}

.invisible {
  display: none;
}

.ellipsis:after {
  content: '…';
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #999;
  margin-top: 60px;
}
</style>
