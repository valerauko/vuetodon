<template>
  <article>
    <div>
      <div v-if="reblog">Boosted by
        <a :href="booster.url">{{ booster.display_name }}</a></div>
      <a :href="author.url">{{ author.display_name }}</a>
      <a :href="status.url" :title="full_time">{{ display_time }}</a>
    </div>
    <div v-html="content"></div>
    <div><button title="Reply" /><button title="Boost" /><button title="Star" /><button title="Etc" /></div>
  </article>
</template>

<script>
import * as Moment from 'moment'
export default {
  name: 'OneStatus',
  props: ['status'],
  computed: {
    reblog () {
      return !!this.status.reblog
    },
    author () {
      if (this.reblog) {
        return this.status.reblog.account
      } else {
        return this.status.account
      }
    },
    raw_time () {
      if (this.reblog) {
        return this.status.reblog.created_at
      } else {
        return this.status.created_at
      }
    },
    full_time () {
      return Moment(this.raw_time).format('Y MMM D, HH:mm:ss')
    },
    display_time () {
      return Moment(this.raw_time).fromNow()
    },
    booster () {
      if (this.reblog) {
        return this.status.account
      }
    },
    content () {
      if (this.reblog) {
        return this.status.reblog.content
      } else {
        return this.status.content
      }
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
</style>
