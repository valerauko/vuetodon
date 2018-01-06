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
        return this.card.description
      }
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
