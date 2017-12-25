/*
// Vue.js client for Mastodon
*/
/* global Vue */

const app = new Vue({
  el: '#vuetodon',
  data: {
    token: '',
    statuses: []
  },
  methods: {
    read: function (endpoint) {
      this.$http.get(this.endpoints[endpoint], {
        headers: { Authorization: 'Bearer ' + this.token }
      }).then(response => {
        console.log(endpoint + ' ' + response.status)
        var result = JSON.parse(response.bodyText)
        console.debug(response)
        this.statuses = result
      }, response => {
        console.log(endpoint + ' request failed')
        console.log(response)
      })
    }
  },
  created: function () {
    this.instance = 'https://pawoo.net'
    this.endpoints = {
      home: this.instance + '/api/v1/timelines/home'
    }
  },
  mounted: function () {
    this.read('home')
  }
})

if (typeof module !== 'undefined') { module.exports = app }
