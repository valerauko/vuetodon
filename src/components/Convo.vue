<template>
  <div>
    <ol v-if="ancestors.length">
      <li v-for="status in ancestors" :key="status.id">
        <one-status :status="status" @deleteToot="deleteSuccess" />
      </li>
    </ol>
    <one-status v-if="coreStatus.id" @deleteToot="deleteSuccess"
                :status="coreStatus" :passedCard="coreCard" />
    <new-toot :replyTo="coreStatus" @newToot="postSuccess" />
    <ol v-if="descendants.length">
      <li v-for="status in descendants" :key="status.id">
        <one-status :status="status" @deleteToot="deleteSuccess" />
      </li>
    </ol>
  </div>
</template>

<script>
import OneStatus from '@/components/OneStatus'
import NewToot from '@/components/NewToot'
import config from '@/lib/config'
export default {
  name: 'Convo',
  components: {
    OneStatus, NewToot
  },
  data () {
    return {
      ancestors: [],
      descendants: [],
      coreStatus: {},
      coreCard: {}
    }
  },
  computed: {
    id () {
      return this.$route.params.id
    },
    endpoint () {
      return config.instance + '/api/v1/statuses/' + this.id
    },
    context () {
      return this.endpoint + '/context'
    }
  },
  watch: {
    id (from, to) {
      if (from === to) {
        return true
      }
      this.init()
    }
  },
  methods: {
    postSuccess (status) {
      this.descendants.unshift(status)
    },
    deleteSuccess (id) {
      if (id === this.id) {
        this.$route.push('Home')
      }
      const notThis = (item) => item.id !== id
      this.descendants = this.descendants.filter(notThis)
      this.ancestors = this.ancestors.filter(notThis)
    },
    init () {
      this.ancestors = []
      this.descendants = []
      if (!this.$root.$data.store.opened || !this.$root.$data.store.opened.status) {
        this.$http.get(this.endpoint, {
          headers: { Authorization: 'Bearer ' + config.token }
        }).then(response => {
          this.coreStatus = response.body
        }, response => console.log(response))
      } else {
        this.coreStatus = this.$root.$data.store.opened.status
        this.coreCard = this.$root.$data.store.opened.card
      }
      this.$http.get(this.context, {
        headers: { Authorization: 'Bearer ' + config.token }
      }).then(response => {
        this.ancestors = response.body.ancestors
        this.descendants = response.body.descendants
      }, response => console.log(response))
    }
  },
  created () {
    this.init()
  }
}
</script>

<style scoped>
ol {
  list-style: none outside none;
}
</style>
