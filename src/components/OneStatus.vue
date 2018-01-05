<template>
  <article>
    <div>
      <div v-if="reblog">Boosted by
        <a :href="booster.url">{{ booster.display_name }}</a></div>
      <a :href="author.url">{{ author.display_name }}</a>
      <a :href="orBoosted.url" :title="fullTime">{{ displayTime }}</a>
    </div>
    <section v-html="content"></section>
    <card v-if="has_card" :card="card"></card>
    <div><button title="Reply" /><button title="Boost" /><button title="Star" /><button title="Etc" /></div>
  </article>
</template>

<script>
import * as Moment from 'moment'
import Card from '@/components/Card'
export default {
  name: 'OneStatus',
  props: ['status'],
  components: {
    Card
  },
  data () {
    return {
    }
  },
  computed: {
    reblog () {
      return !!this.status.reblog
    },
    orBoosted () {
      return this.reblog ? this.status.reblog : this.status
    },
    author () {
      return this.orBoosted.account
    },
    rawTime () {
      return Moment(this.orBoosted.created_at)
    },
    fullTime () {
      return this.rawTime.format('Y MMM D, HH:mm:ss')
    },
    displayTime () {
      return this.rawTime.fromNow()
    },
    booster () {
      if (this.reblog) {
        return this.status.account
      }
    },
    content () {
      return this.orBoosted.content
    }
  },
  created () {
    this.initCard = function () {
      if (/<a href=[^>]+ rel="nofollow noopener"/.test(this.orBoosted.content)) {
        // wait at least 10 seconds since toot creation to look at Card
        setTimeout(this.fetchCard, 10000 - Moment().diff(this.rawTime))
      }
    }
    this.initCard()
  },
  methods: {
    fetchCard () {
      this.$http
          .get('https://pawoo.net/api/v1/statuses/' + this.status.id + '/card')
          .then(response => {
            if (response.body.url) {
              this.status.card = response.body
            }
          }, response => {
            console.log('Failed to fetch card')
          })
    }
  }
}
</script>

<style scoped>
article {
  border: 1px solid #999;
  border-radius: 5px;
  width: 50vw;
  margin: .5em auto;
  padding: 1em;
}
article section a.noopener {
  display: none;
}
</style>
