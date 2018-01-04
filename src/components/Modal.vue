<template>
  <transition name="modal">
    <div class="modal-mask" @click="close" v-show="show">
      <div class="modal-container" @click.stop>
        <slot/>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Modal',
  props: ['show'],
  methods: {
    close () {
      this.$emit('close')
    }
  },
  mounted () {
    // could do @keydown.esc, but that doesn't seem to work document-wide
    document.addEventListener('keydown', e => {
      if (this.show && e.keyCode === 27) {
        this.close()
      }
    })
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}
.modal-mask {
  position: fixed;
  z-index: 42;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .7);
  opacity: 100%;
  transition: opacity .3s ease;
}
.modal-container {
  width: 300px;
  margin: 50px auto 0;
  padding: 20px 30px;
  background-color: #111;
  border-radius: 5px;
  box-shadow: 0 0 5px white;
  transition: all .3s ease;
}
.modal-enter, .modal-leave-active {
  opacity: 0;
}
.modal-enter .modal-container, .modal-leave-active .modal-container {
  transform: scale(1.1);
}
</style>
