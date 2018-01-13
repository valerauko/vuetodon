<template>
  <article>
    <div>
      <div v-if="reblog">Boosted by
        <a :href="booster.url">{{ booster.display_name || booster.username }}</a></div>
      <a :href="author.url">{{ author.display_name || author.username }}</a>
      <a :href="orBoosted.url" :title="fullTime">{{ displayTime }}</a>
    </div>
    <section v-if="orBoosted.spoiler_text" v-html="orBoosted.spoiler_text"></section>
    <section v-bind:class="{ nsfw: orBoosted.spoiler_text }"
             v-swapLinks="swapLinks"
             v-html="content"></section>
    <section :class="['images', 'i' + orBoosted.media_attachments.length]"
             v-if="orBoosted.media_attachments.length > 0">
      <a v-bind:class="{ nsfw: isNsfw }"
         v-for="image in images"
         :href="image.remote_url || image.url">
        <img :src="image.preview_url"
             :class="{ portrait: isPortrait(image) }" />
      </a>
    </section>
    <card v-bind:class="{ nsfw: isNsfw }"
          v-if="card"
          :card="card"></card>
    <div>
      <button title="Reply" class="reply"
        @click="openSelf"
      /><button :title="status.reblogged ? 'Unboost' : 'Boost'"
        :disabled="!isPublic"
        :class="['boost', status.reblogged ? 'active' : '']"
        @click="toggleBoost"
      /><button :title="status.favourited ? 'Unstar' : 'Star'"
        :class="['star', status.favourited ? 'active' : '']"
        @click="toggleStar"
      /><button title="Delete"
        v-if="author.acct === $root.$data.store.currentUser.acct"
        class="delete"
        @click="destroy"
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
  props: ['status', 'passedCard'],
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
    isPublic () {
      return this.status.visibility === 'public' &&
             this.reblog ? this.status.reblog.visibility === 'public' : true
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
      return this.orBoosted.content.replace(/`(.+?)`/u, '<code>$1</code>')
    }
  },
  created () {
    if (!this.images.length && /<a [^>]*rel="nofollow noopener"/.test(this.orBoosted.content)) {
      // wait at least 10 seconds since toot creation to look at Card
      setTimeout(this.fetchCard, 10000 - Moment().diff(this.rawTime))
    }
    this.endpoint = config.instance + '/api/v1/statuses/' + this.status.id
  },
  methods: {
    isPortrait (img) {
      let src = img.meta && img.meta.original
      if (!src || !src.width || !src.height) {
        return false
      }
      return src.height > src.width
    },
    destroy () {
      if (!confirm('Are you sure you want to delete this toot?')) {
        return true
      }
      if (this.author.acct !== this.$root.$data.store.currentUser.acct) {
        console.log('Can\'t delete someone else\'s toot')
        return false
      }
      this.$http.delete(this.endpoint, {
        headers: { Authorization: 'Bearer ' + config.token }
      }).then(_ => {
        this.$emit('deleteToot', this.status.id)
      }, response => console.log('Failed to delete toot'))
    },
    toggleBoost () {
      if (!this.isPublic) {
        console.log('Can\'t boost private toot')
        return false
      }
      if (this.status.reblogged) {
        this.$http.post(this.endpoint + '/unreblog', {}, {
          headers: { Authorization: 'Bearer ' + config.token }
        }).then(_ => { this.status.reblogged = false }, _ => {})
      } else {
        this.$http.post(this.endpoint + '/reblog', {}, {
          headers: { Authorization: 'Bearer ' + config.token }
        }).then(_ => { this.status.reblogged = true }, _ => {})
      }
    },
    toggleStar () {
      if (this.status.favourited) {
        this.$http.post(this.endpoint + '/unfavourite', {}, {
          headers: { Authorization: 'Bearer ' + config.token }
        }).then(_ => { this.status.favourited = false }, _ => {})
      } else {
        this.$http.post(this.endpoint + '/favourite', {}, {
          headers: { Authorization: 'Bearer ' + config.token }
        }).then(_ => { this.status.favourited = true }, _ => {})
      }
    },
    fetchCard (attempts = 0) {
      if (this.passedCard) {
        this.card = this.passedCard
        return true
      }
      this.$http
          .get(this.endpoint + '/card', {
            headers: { Authorization: 'Bearer ' + config.token }
          })
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
          link.innerHTML = '<span class="linkReplace image" />'
        }
        if (this.status.card && this.status.card.url === link.href) {
          link.innerHTML = '<span class="linkReplace card" />'
        }
      })
    },
    openSelf () {
      this.$root.$data.store.opened = { status: this.status, card: this.card }
      this.$router.push({
        name: 'Convo',
        params: { id: this.status.id }
      })
    }
  }
}
</script>

<style scoped>
article {
  border: 1px solid #999;
  border-radius: 5px;
  width: 600px;
  margin: .5em auto;
  padding: 1em;
  text-align: left;
}

article section a.noopener {
  display: none;
}

a {
  display: inline-block
}

article div button {
  width: 2em;
  transition: transform .5s ease;
  background: center center / 75% no-repeat #666;
}

article div button:hover {
  background-color: #999
}

article div button.active {
  transform: rotate(360deg);
  background-color: #ccc
}

article div button.boost {
  background-image: url('/static/icons/boost.png')
}

article div button.star {
  background-image: url('/static/icons/star.png')
}

article div button.reply {
  background-image: url('/static/icons/reply.png')
}

article div button.delete {
  background-image: url('/static/icons/delete.png')
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

.images {
  margin: 0 auto;
  display: grid;
  width: 402px;
  grid-gap: 2px;
}

.images.i1 {
  grid-template-columns: 400px;
  grid-auto-rows: 300px;
}

.images.i2 {
  grid-template-columns: 200px 200px;
  grid-auto-rows: 200px;
}

.images.i3 {
  grid-template-columns: calc(800px / 3) calc(400px / 3);
  grid-auto-rows: calc(400px / 3);
}

.images.i4 {
  grid-template-columns: 304px 100px;
  grid-auto-rows: 100px;
}

.images a {
  max-width: 100%;
  max-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.images a img {
  flex: none;
  height: 100%;
  width: auto;
}

.images a img.portrait {
  width: 100%;
  height: auto;
}

.images a:first-of-type {
  grid-column: 1;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}

.images a:nth-of-type(2) {
  grid-row: 1;
  border-top-right-radius: 5px;
}

.images a:nth-of-type(3) {
  grid-row: 2;
}

.images a:last-of-type {
  border-bottom-right-radius: 5px;
}

.images.i1 a {
  border-radius: 5px;
  grid-column: 1;
  grid-row: 1;
}

.images.i2 a:first-of-type {
  grid-row: 1;
}

.images.i2 a:last-of-type {
  grid-column: 2;
}

.images.i3 a:first-of-type {
  grid-row: 1 / 3;
}

.images.i4 a:first-of-type {
  grid-row: 1 / 4;
}

.images.i4 a:nth-of-type(4) {
  grid-row: 3;
}

</style>
