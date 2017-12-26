<template>
  <div>
    <h2>Log in!</h2>
    <form>
      <input type="text" v-model="instance" placeholder="Your instance" />
      <input type="text" v-model="username" placeholder="Username" />
      <input type="password" v-model="password" placeholder="Password" />
      <button @click="login">Toot!</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      instance: '',
      username: '',
      password: ''
    }
  },
  methods: {
    login () {
      var known = this.store.out('known_instances')
      if (known == null || known[new URL(this.instance).host] == null) {
        this.registerWithInstance(this.instance).then(this.attemptLogin)
      } else {
        this.attemptLogin()
      }
    }
  },
  created () {
    this.store = {
      in: (key, item) => {
        var storable = JSON.stringify(item)
        localStorage.setItem(key, storable)
        return storable
      },
      out: key => JSON.parse(localStorage.getItem(key))
    }
    this.registerWithInstance = uri => {
      uri = new URL(uri)
      var target = uri.origin
      this.$http.post(target + '/api/v1/apps', {
        client_name: 'vuetodon',
        redirect_uris: 'http://localhost:3000',
        scopes: ['read', 'write', 'follow'].join(' '),
        website: 'http://valerauko.net'
      }).then(response => {
        var known = this.store.out('known_instances') || {}
        known[uri.host] = {
          host: uri.origin,
          client_id: response.body.client_id,
          client_secret: response.body.client_secret
        }
        this.store.in('known_instances', known)
        console.log('App registration successful')
      }, response => {
        console.log('App registration failed')
        console.log(response)
      })
    }
    this.attemptLogin = () => {
      var instance = this.store.out('known_instances')[new URL(this.instance).host]
      this.$http.post(instance.host + '/oauth/token', {
        client_id: instance.client_id,
        client_secret: instance.client_secret,
        grant_type: 'password',
        username: this.username,
        password: this.password,
        scope: ['read', 'write', 'follow'].join(' ')
      }).then(response => {
        console.log('Login successful')
        console.log(response.body)
      }, response => {
        console.log('Login failed')
        console.log(response)
      })
    }
  }
}
</script>

<style scoped>
input {
  display: block;
  background: #111;
  border: 1px solid #999;
  border-radius: 5px;
  margin: 0.5em auto;
  padding: 1em;
  width: 30vw;
  font: inherit;
  color: #fff;
}
</style>
