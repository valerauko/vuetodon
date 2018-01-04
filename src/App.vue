<template>
  <div id="app">
    <login v-if="!loggedIn" :show="!loggedIn" @close="loggedIn = true" />
    <div v-if="loggedIn">
      <header>
        <button title="Home"><span>Home</span></button>
        <button title="Local"><span>Local</span></button>
        <button title="Fed"><span>Fed</span></button>
        <button title="Log out" @click="loggingOut = true">
          <span>Log out</span>
        </button>
      </header>
      <logout v-if="loggingOut" :show="loggingOut"
              @logout="logOut" @close="loggingOut = false" />
      <router-view/>
    </div>
  </div>
</template>

<script>
import Login from '@/components/Login'
import Logout from '@/components/Logout'
export default {
  name: 'app',
  components: {
    Login,
    Logout
  },
  data () {
    return {
      loggingOut: false,
      loggedIn: localStorage.getItem('token') != null
    }
  },
  methods: {
    logOut () {
      this.loggedIn = false
    }
  }
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
