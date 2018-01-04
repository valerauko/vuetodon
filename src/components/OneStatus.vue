<template>
  <article>
    <div>
      <div v-if="reblog">Boosted by
        <a :href="booster.url">{{ booster.display_name }}</a></div>
      <a :href="author.url">{{ author.display_name }}</a>
      <a :href="or_boosted.url" :title="full_time">{{ display_time }}</a>
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
      has_card: false,
      card: {}
    }
  },
  computed: {
    reblog () {
      return !!this.status.reblog
    },
    or_boosted () {
      return this.reblog ? this.status.reblog : this.status
    },
    author () {
      return this.or_boosted.account
    },
    raw_time () {
      return Moment(this.or_boosted.created_at)
    },
    full_time () {
      return this.raw_time.format('Y MMM D, HH:mm:ss')
    },
    display_time () {
      return this.raw_time.fromNow()
    },
    booster () {
      if (this.reblog) {
        return this.status.account
      }
    },
    content () {
      return this.or_boosted.content
    }
  },
  created () {
    if (/<a href=[^>]+ rel="nofollow noopener"/.test(this.or_boosted.content)) {
      // wait at least 10 seconds since toot creation to look at Card
      setTimeout(this.fetch_card, 10000 - Moment().diff(this.raw_time))
    }
  },
  methods: {
    fetch_card () {
      this.$http
          .get('https://pawoo.net/api/v1/statuses/' + this.status.id + '/card')
          .then(response => {
            if (response.body.url) {
              this.card = response.body
              this.has_card = true
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
