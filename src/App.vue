<template>
  <div id="app" @login="updateCurrentUser">
    <login v-if="!loggedIn" :show="!loggedIn" @close="loggedIn = true" />
    <div v-if="loggedIn">
      <header>
        <router-link to="/" id="home" title="Home"><span>Home</span></router-link>
        <router-link to="/local" id="local" title="Local"><span>Local</span></router-link>
        <router-link to="/fed" id="fed" title="Fed"><span>Fed</span></router-link>
        <a href="#" title="Log out" id="logout" @click="loggingOut = true"><span>Log out</span></a>
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
  font: normal normal 1em/1.5em 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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

header {
  display: flex;
  justify-content: center;
}

header a span {
  display: none
}

#home {
  background-image: url('/static/icons/home.png');
}

#local {
  background-image: url('/static/icons/local.png');
}

#fed {
  background-image: url('/static/icons/fed.png');
}

#logout {
  background-image: url('/static/icons/logout.png');
}

button, header a {
  font: inherit;
  height: 2em;
  padding: 0;
  margin: 0 0.5em;
  background: #666;
  border: 1px solid #999;
  border-radius: 1em;
  cursor: pointer;
}

header a {
  display: inline-block;
  width: 2em;
  background: center center / 75% #666 no-repeat;
}

header a:hover {
  background-color: #999;
}

.linkReplace {
  display: inline-block;
  margin-bottom: -3px;
  margin-left: 3px;
  height: 1.2em;
  width: 1.2em;
  background: center center / 1em #666 no-repeat;
}

.linkReplace.image {
  background-image: url('/static/icons/image.png')
}

.linkReplace.card {
  background-image: url('/static/icons/link.png')
}

.invisible {
  display: none;
}

.ellipsis:after {
  content: '…';
}
</style>
