<template>
  <form @submit.prevent="send" @keydown.ctrl.enter.prevent="send">
    <textarea placeholder="Toot something!"
      v-model="message"
      @paste="onPaste"
    ></textarea>
    <div class="previews" v-if="uploads.length > 0">
      <div v-for="image in uploads">
        <img :src="image.preview_url" />
        <button @click="unUpload(image)">Delete</button>
      </div>
    </div>
    <div>
      <label class="fileSelect" for="fileUploader"
      /><button @click="send">Toot!</button>
      <input id="fileUploader" name="fileUploader" type="file" multiple
        @change="onSelectFile"
        :disabled="uploads.length > 3"
        accept="image/jpeg,image/png,image/gif" />
    </div>
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
  props: ['replyTo'],
  methods: {
    getMentionsFrom (obj) {
      var at = [obj.account.acct, ...obj.mentions.map(mention => mention.acct)]
      if (obj.reblog && obj.reblog.id) {
        at = [...at, ...this.getMentionsFrom(obj.reblog)]
      }
      return [...new Set(at)].filter(name => {
        return name !== this.$root.$data.store.currentUser.acct
      }).map(name => '@' + name)
    },
    send () {
      if (this.sending || (!this.message.length && !this.uploads.length)) {
        return true
      }
      this.sending = true
      this.$http.post(this.endpoints.toot, {
        status: this.message,
        media_ids: this.uploads.slice(0, 4).map(upload => upload.id),
        in_reply_to_id: this.replyTo.id
      }, {
        headers: { Authorization: 'Bearer ' + config.token }
      }).then(response => {
        this.message = ''
        this.uploads = []
        this.sending = false
        this.$emit('newToot', response.body)
      }, response => console.log('Request failed.'))
    },
    onSelectFile (e) {
      let files = e.target.files || e.dataTransfer.files
      if (!files.length) {
        return true
      }
      [...files].map(this.uploadOne)
    },
    onPaste (e) {
      if (!e.clipboardData.items || this.uploads.length > 3) {
        return true
      }
      let images = [...e.clipboardData.items].filter(file => {
        return file.type.match(/^image\/(jpeg|png|gif)/i)
      })
      images.map(this.uploadOne)
    },
    uploadOne (image) {
      let formData = new FormData()
      formData.append('file', image instanceof File ? image : image.getAsFile())
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
  },
  mounted () {
    if (this.replyTo.account) {
      let mentions = this.getMentionsFrom(this.replyTo).join(' ')
      if (mentions.length > 2) {
        this.message = mentions + ' '
      }
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

div {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

button {
  background: #666;
  padding: 0 1em;
  color: #111;
}

label.fileSelect {
  display: inline-block;
  /* with 2em the same as the buttons it'd be 2px bigger than the buttons? */
  height: 30.1667px;
  width: 30.1667px;
  padding: 0;
  margin: 0 0.5em;
  background: #666;
  border: 1px solid #999;
  border-radius: 1em;
  background: url('/static/icons/camera.png') center center / 75% no-repeat #666;
}

#fileUploader {
  display: none;
}

div.previews div {
  max-width: 10vw;
  height: 10vw;
  flex-direction: column;
  justify-content: center;
  padding: 0 1em;
  overflow: hidden;
}

div.previews div img {
  max-height: 8vw;
  max-width: 100%;
  height: auto;
}

div.previews div button {
  margin: .5em;
}
</style>
