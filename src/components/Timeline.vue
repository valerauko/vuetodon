<template>
  <div>
    <new-toot/>
    <ol>
      <li v-for="status in statuses">
        <one-status :status="status"></one-status>
      </li>
    </ol>
  </div>
</template>

<script>
import OneStatus from './OneStatus'
import NewToot from '@/components/NewToot'
export default {
  name: 'Timeline',
  data () {
    return {
      statuses: []
    }
  },
  methods: {
    read: function (endpoint) {
      this.$http.get(this.endpoints[endpoint], {
        headers: { Authorization: 'Bearer ' + this.token }
      }).then(response => {
        console.log(endpoint + ' ' + response.status)
        var result = JSON.parse(response.bodyText)
        console.log(response)
        this.statuses = result
      }, response => {
        console.log(endpoint + ' request failed')
        console.log(response)
      })
    },
    stream: function () {
      if (this.token === '') {
        return false
      }
      var sock = new WebSocket(this.endpoints.stream +
                               '?access_token=' + this.token +
                               '&stream=user')
      var listener = (event) => {
        event = JSON.parse(event.data)
        event.payload = JSON.parse(event.payload)
        switch (event.event) {
          case 'update':
            this.statuses.unshift(event.payload)
            if (this.statuses.length > 3) {
              this.statuses = this.statuses.slice(0, 3)
            }
            break
          case 'delete':
            this.statuses = this.statuses.filter(
              elem => elem.id !== event.payload
            )
            break
        }
      }
      sock.onmessage = listener
    }

  },
  components: {
    NewToot,
    OneStatus
  },
  created: function () {
    this.$router.push('Login') // redirect everything to login for now
    this.token = ''
    this.endpoints = {
      home: 'https://pawoo.net/api/v1/timelines/home',
      stream: 'ws://pawoo.net/api/v1/streaming/'
    }
  },
  mounted: function () {
    this.stream()
  }
}
</script>

<style scoped>
ol {
  list-style: none outside none;
}
</style>
