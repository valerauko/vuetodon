<template>
  <div>
    <new-toot/>
    <ol>
      <li v-for="status in statuses" :key="status.id">
        <one-status :status.sync="status"></one-status>
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
      timeline: 'home'
    }
  },
  watch: {
    '$route' (to, from) {
      this.timeline = to.name.toLowerCase()
      this.socket.close()
      this.startStream()
    }
  },
  methods: {
    startStream () {
      this.read().then(this.stream)
    },
    read () {
      let endpoint = this.endpoints.rest[this.timeline]
      return this.$http.get(endpoint, {
        params: { limit: this.statusLimit },
        headers: { Authorization: 'Bearer ' + this.token }
      }).then(response => {
        var result = JSON.parse(response.bodyText)
        this.statuses = result
      }, response => {
        console.log(endpoint + ' request failed')
        console.log(response)
      })
    },
    stream () {
      this.socket = new WebSocket(this.endpoints.stream[this.timeline])
      const listener = (event) => {
        event = JSON.parse(event.data)
        event.payload = JSON.parse(event.payload)
        switch (event.event) {
          case 'update':
            this.statuses.unshift(event.payload)
            if (this.statuses.length > this.statusLimit) {
              this.statuses = this.statuses.slice(0, this.statusLimit)
            }
            break
          case 'delete':
            this.statuses = this.statuses.filter(
              elem => elem.id !== event.payload
            )
            break
        }
      }
      this.socket.onmessage = listener
    }
  },
  components: {
    NewToot,
    OneStatus
  },
  created () {
    this.statusLimit = 20
    this.token = JSON.parse(localStorage.getItem('token'))
    let instance = JSON.parse(localStorage.getItem('instance'))
    let base = instance + '/api/v1'
    let apiBase = base + '/timelines'
    let streamBase = base.replace(/^https?/i, 'ws') +
                     '/streaming?access_token=' + this.token + '&stream='
    this.endpoints = {
      rest: {
        home: apiBase + '/home',
        fed: apiBase + '/public',
        local: apiBase + '/public?local=true'
      },
      stream: {
        home: streamBase + 'user',
        fed: streamBase + 'public',
        local: streamBase + 'public:local'
      }
    }
  },
  mounted () {
    this.startStream()
  }
}
</script>

<style scoped>
ol {
  list-style: none outside none;
}
</style>
