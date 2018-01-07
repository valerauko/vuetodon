<template>
  <div>
    <new-toot/>
    <button v-if="scrolled" @click="restartStream">Catch up at once!</button>
    <ol @deleteToot="deleteToot" @newToot="newToot">
      <li v-for="status in statuses" :key="status.id">
        <one-status :status.sync="status"></one-status>
      </li>
    </ol>
  </div>
</template>

<script>
import OneStatus from '@/components/OneStatus'
import NewToot from '@/components/NewToot'
import config from '@/lib/config'
export default {
  name: 'Timeline',
  data () {
    return {
      statuses: [],
      newStatuses: [],
      scrolled: false
    }
  },
  props: ['timeline'],
  watch: {
    timeline (to, from) {
      console.log('Changed route!')
      this.statuses = this.newStatuses = []
      this.socket.close()
      this.startStream()
    }
  },
  methods: {
    scollHandler () {
      let el = document.documentElement
      // prevent spamming requests
      if (this.fired) { return true }
      // stop stream when scrolling
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.close()
      }
      this.scrolled = true
      if (el.scrollTop === 0) {
        this.scrolled = false
        this.readUp()
      } else if (el.scrollTop + el.clientHeight >= el.offsetHeight) {
        this.readDown()
      }
    },
    readScroll (way, pass) {
      return this.read(config.scrollLimit, pass).then(() => {
        let statuses = [this.statuses, this.newStatuses]
        // the direction we're reading just changes which gets concatenated to which
        this.statuses = statuses[+(way === 'up')]
                          .concat(statuses[+(way !== 'up')])
        this.fired = false
      })
    },
    readDown () {
      let opt = {}
      if (this.statuses.length > 0) {
        opt = { max_id: this.statuses[this.statuses.length - 1].id }
      }
      return this.readScroll('down', opt)
    },
    readUp () {
      return this.readScroll('up',
        { since_id: this.statuses[0] && this.statuses[0].id }
      ).then(() => {
        // restart stream if reached top
        if (this.newStatuses.length < config.scrollLimit) {
          this.stream()
        } else {
          window.scrollTo(0, 10)
        }
      })
    },
    read (howMany = config.statusLimit, option = {}) {
      let endpoint = this.endpoints.rest[this.timeline]
      return this.$http.get(endpoint, {
        params: Object.assign({ limit: howMany }, option),
        headers: { Authorization: 'Bearer ' + config.token }
      }).then(response => {
        var result = JSON.parse(response.bodyText)
        this.newStatuses = result
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
            this.newToot(event.payload)
            break
          case 'delete':
            this.deleteToot(event.payload)
            break
        }
      }
      this.socket.onmessage = listener
      this.socket.onerror = error => console.log(error)
    },
    newToot (status) {
      this.statuses = [status,
                       ...this.statuses.filter(toot => toot.id !== status.id)
                                       .slice(0, config.statusLimit - 1)]
    },
    deleteToot (id) {
      this.statuses = this.statuses.filter(elem => {
        let ref = elem.reblog ? elem.reblog.id : elem.id
        return ref !== id
      })
    },
    startStream () {
      this.readDown().then(this.stream)
    },
    restartStream () {
      window.scrollTo(0, 0)
      this.startStream()
    }
  },
  components: {
    NewToot,
    OneStatus
  },
  created () {
    let base = config.instance + '/api/v1'
    let apiBase = base + '/timelines'
    let streamBase = base.replace(/^https?/i, 'ws') +
                     '/streaming?access_token=' + config.token + '&stream='
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

    this.fired = false
    window.addEventListener('scroll', this.scollHandler)
  },
  destroyed () {
    this.socket.close()
    window.removeEventListener('scroll', this.scollHandler)
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
