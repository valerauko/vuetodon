export default {
  statusLimit: 20,
  scrollLimit: 10,
  token: JSON.parse(localStorage.getItem('token')),
  instance: JSON.parse(localStorage.getItem('instance')),
  reload: () => {
    this.token = JSON.parse(localStorage.getItem('token'))
    this.instance = JSON.parse(localStorage.getItem('instance'))
  }
}
