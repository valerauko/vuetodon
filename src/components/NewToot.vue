<template>
  <form>
    <textarea placeholder="Toot something!"
      v-model="message"
      @paste="onPaste"
    ></textarea>
    <div v-if="uploads.length > 0">
      <template v-for="image in uploads">
        <img :src="image.preview_url" />
        <button @click="unUpload(image)">Delete</button>
      </template>
    </div>
    <button @click="send">Toot!</button>
  </form>
</template>

<script>
import config from '@/lib/config'
export default {
  name: 'NewToot',
  data () {
    return {
      message: '',
      uploads: []
    }
  },
  methods: {
    send () {
      this.$http.post(this.endpoints.toot, {
        status: this.message
      }, {
        headers: { Authorization: 'Bearer ' + config.token }
      }).then(_ => {}, response => console.log('Request failed.'))
    },
    onPaste (e) {
      if (!e.clipboardData.items) {
        return true
      }
      let images = [...e.clipboardData.items].filter(file => {
        return file.type.match(/^image\/(jpeg|png|gif)/i)
      })
      images.map(this.uploadOne)
    },
    uploadOne (image) {
      let formData = new FormData()
      formData.append('file', image.getAsFile())
      this.$http.post(this.endpoints.media, formData, { headers: {
        Authorization: 'Bearer ' + config.token,
        'Content-Type': 'multipart/form-data'
      }}).then(response => this.uploads.push(response.body),
               _ => console.log('Upload failed'))
    },
    unUpload (image) {
      this.uploads = this.uploads.filter(upload => upload.id !== image.id)
    }
  },
  created () {
    this.endpoints = {
      toot: config.instance + '/api/v1/statuses',
      media: config.instance + '/api/v1/media'
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
