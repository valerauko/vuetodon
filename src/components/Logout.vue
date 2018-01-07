<template>
  <modal :show="show" @close="close">
    <h2>Log out</h2>
    <p>Are you sure you want to log out?</p>
    <p>
      <button @click="logOut">Yes, log me out!</button>
      <button @click="close">Scratch that</button>
    </p>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
export default {
  name: 'Logout',
  components: {
    Modal
  },
  props: ['show'],
  methods: {
    close () {
      this.$emit('close')
    },
    logOut () {
      this.$emit('logout')
      delete this.$root.$data.store.currentUser
      localStorage.removeItem('token')
      console.log('Logout successful')
      this.close()
    }
  }
}
</script>
