<template>
  <article>
    <div>
      <div v-if="reblog">Boosted by
        <a :href="booster.url">{{ booster.display_name }}</a></div>
      <a :href="author.url">{{ author.display_name }}</a>
      <a :href="orBoosted.url" :title="fullTime">{{ displayTime }}</a>
    </div>
    <section v-if="orBoosted.spoiler_text" v-html="orBoosted.spoiler_text"></section>
    <section v-bind:class="{ nsfw: orBoosted.spoiler_text }"
             v-swapLinks="swapLinks"
             v-html="content"></section>
    <section v-if="orBoosted.media_attachments.length > 0">
      <a v-bind:class="{ nsfw: isNsfw }"
         v-for="image in images"
         :href="image.text_url">
        <img :src="image.preview_url" />
      </a>
    </section>
    <card v-bind:class="{ nsfw: isNsfw }"
          v-if="card"
          :card="card"></card>
    <div>
      <button title="Reply"
      /><button title="Boost"
      /><button title="Star"
      /><button title="Delete"
        v-if="author.acct == $root.$data.store.currentUser.acct"
      />
    </div>
  </article>
</template>

<script>
import * as Moment from 'moment'
import Card from '@/components/Card'
import config from '@/lib/config'
export default {
  name: 'OneStatus',
  props: ['status'],
  components: {
    Card
  },
  data () {
    return {
      card: {}
    }
  },
  directives: {
    swapLinks (el, binding) {
      binding.value(el)
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
    images () {
      return this.orBoosted.media_attachments.length > 0 &&
             this.orBoosted.media_attachments.filter(item => item.type === 'image')
    },
    booster () {
      if (this.reblog) {
        return this.status.account
      }
    },
    isNsfw () {
      return this.orBoosted.sensitive
    },
    content () {
      return this.orBoosted.content
    }
  },
  created () {
    if (/<a href=[^>]+ rel="nofollow noopener"/.test(this.orBoosted.content)) {
      // wait at least 10 seconds since toot creation to look at Card
      setTimeout(this.fetchCard, 10000 - Moment().diff(this.rawTime))
    }
  },
  methods: {
    fetchCard (attempts = 0) {
      // console.log('Fetching card for toot#' + this.status.id)
      this.$http
          .get(config.instance + '/api/v1/statuses/' + this.status.id + '/card')
          .then(response => {
            if (response.body.url) {
              this.card = response.body
            }
          }, response => {
            if (attempts < 2) {
              setTimeout(() => this.fetchCard(++attempts), 2000)
            } else {
              console.log('Failed to fetch card')
            }
          })
    },
    swapLinks (el) {
      let links = el.querySelectorAll('a')
      if (links.length < 1) { return true }
      [...links].map(link => {
        if (this.images && this.images.find(img => img.text_url === link.href)) {
          link.innerHTML = 'AAA'
        }
        if (this.status.card && this.status.card.url === link.href) {
          link.innerHTML = 'BBB'
        }
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

.invisible {
  display: none;
}

.ellipsis:after {
  content: '…';
}

a {
  display: inline-block
}

.nsfw {
  background: #000;
  transition: all .5s ease;
}

.nsfw > * {
  opacity: 0;
  transition: all .5s ease;
}

.nsfw:hover {
  background: #111;
}

.nsfw:hover > * {
  opacity: 1;
}
</style>
