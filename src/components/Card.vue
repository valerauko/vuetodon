<template>
  <section class="card">
    <a :href="card.url" rel="nofollow noopener" target="_blank">
      <img v-if="card.image" :src="card.image" />
      <h1>{{ card.title }}</h1>
      <p>{{ card.description }}</p>
    </a>
  </section>
</template>

<script>
export default {
  name: 'Card',
  props: ['card']
}
</script>

<style scoped>
section.card {
  width: 70%;
  margin: .5em auto;

}
</style>
