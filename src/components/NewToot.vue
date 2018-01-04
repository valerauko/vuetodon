<template>
  <form>
    <textarea v-model="message" placeholder="Toot something!"></textarea>
    <button @click="send">Toot!</button>
  </form>
</template>

<script>
export default {
  name: 'NewToot',
  data () {
    return {
      message: ''
    }
  },
  methods: {
    send: function () {
      console.log('Attempting toot.')
      this.$http.post(this.endpoints.toot, { status: this.message }).then(response => {
        console.log('Successfully tooted.')
      }, response => {
        console.log('Request failed.')
        console.log(response)
      })
    }
  },
  created: function () {
    this.endpoints = {
      toot: 'https://pawoo.net/api/v1/statuses'
    }
  }
}
</script>

<style scoped>
textarea {
  display: block;
  background: #111;
  border: 1px solid #999;
  border-radius: 5px;
  margin: 0.5em auto;
  padding: 1em;
  width: 30vw;
  font: inherit;
  color: #fff;
}
</style>
