<template>
  <div>
    <new-toot/>
    <div>Currently racing past at {{tpm}} toot/min!</div>
    <ol>
      <li v-for="status in statuses">
        <one-status :status="status"></one-status>
      </li>
    </ol>
  </div>
</template>

<script>
import OneStatus from '@/components/OneStatus'
import NewToot from '@/components/NewToot'
import * as Moment from 'moment'
export default {
  name: 'Timeline',
  data () {
    return {
      statuses: [],
      seen: 0,
      now: Moment()
    }
  },
  computed: {
    tpm () {
      return Math.floor(
        this.seen / Moment.duration(this.now.diff(this.started)).asMinutes()
      )
    }
  },
  methods: {
    read (endpoint) {
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
    stream () {
      var sock = new WebSocket(this.endpoints.stream +
                               '?access_token=' + this.token +
                               '&stream=public')
      var listener = (event) => {
        event = JSON.parse(event.data)
        event.payload = JSON.parse(event.payload)
        switch (event.event) {
          case 'update':
            this.seen++
            this.now = Moment()
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
  created () {
    this.started = Moment()
    this.token = ''
    this.endpoints = {
      home: 'https://pawoo.net/api/v1/timelines/home',
      stream: 'ws://pawoo.net/api/v1/streaming/'
    }
  },
  mounted () {
    this.stream()
  }
}
</script>

<style scoped>
ol {
  list-style: none outside none;
}
</style>
