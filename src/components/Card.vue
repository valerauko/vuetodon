<template>
  <section class="card">
    <a :href="card.url" rel="nofollow noopener" target="_blank">
      <img v-if="card.image" :src="card.image" />
      <h1>{{ card.title }}</h1>
      <p v-if="description">{{ description }}</p>
      <div v-if="card.type === 'video'" v-html="card.html" />
    </a>
  </section>
</template>

<script>
export default {
  name: 'Card',
  props: ['card'],
  computed: {
    description () {
      if (typeof this.card.description !== 'undefined' &&
          this.card.description.length > 0) {
        return this.truncate(this.card.description)
      }
    }
  },
  methods: {
    truncate (str) {
      let max = 150
      if (typeof str !== 'string' || str.length <= max) {
        return str
      }
      let mid = /[\s?!.\u3000-\u303f]/u // range of cjk punctuation
      var broken = false
      const merge = (acc, curr) => {
        let ifAdded = acc.length + curr.length
        if (!broken && ifAdded < max) {
          return acc + curr + (str[ifAdded] ? str[ifAdded] : '')
        } else {
          broken = true
          return acc
        }
      }
      return str.split(mid).reduce(merge, '')
    }
  }
}
</script>

<style scoped>
section.card {
  width: 70%;
  margin: .5em auto;
}
</style>
