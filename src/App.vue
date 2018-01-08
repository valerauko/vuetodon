<template>
  <div id="app" @login="updateCurrentUser">
    <login v-if="!loggedIn" :show="!loggedIn" @close="loggedIn = true" />
    <div v-if="loggedIn">
      <header>
        <router-link to="/" title="Home"><span>Home</span></router-link>
        <router-link to="/local" title="Local"><span>Local</span></router-link>
        <router-link to="/fed" title="Fed"><span>Fed</span></router-link>
        <a href="#" title="Log out" @click="loggingOut = true"><span>Log out</span></a>
      </header>
      <logout v-if="loggingOut" :show="loggingOut"
              @logout="logOut" @close="loggingOut = false" />
      <router-view />
    </div>
  </div>
</template>

<script>
import Login from '@/components/Login'
import Logout from '@/components/Logout'
import config from '@/lib/config'
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
    },
    updateCurrentUser () {
      this.$http
          .get(config.instance + '/api/v1/accounts/verify_credentials', {
            headers: { Authorization: 'Bearer ' + config.token }
          }).then(response => {
            this.$root.$data.store.currentUser = response.body
          }, response => console.log('Failed to fetch current user'))
    }
  },
  created () {
    if (this.loggedIn && !this.$root.$data.store.currentUser) {
      this.updateCurrentUser()
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

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #999;
  margin-top: 60px;
}

/* HACK: no idea why, but unless it's here, p styles don't apply */
article section.nsfw > p {
  transition: .5s ease;
  opacity: 0
}

article section.nsfw:hover > p {
  opacity: 1
}

button {
  height: 2em;
  padding: 0;
  margin: 0 0.5em;
  background: #111;
  border: 1px solid #999;
  border-radius: 1em;
}

.invisible {
  display: none;
}

.ellipsis:after {
  content: '…';
}
</style>
