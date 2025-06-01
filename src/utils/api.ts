import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { HOST, HOST_PORT } from '@/config'

// The API used around the whole project.
const api = axios.create({
  baseURL: `http://${HOST}:${HOST_PORT}`,
  timeout: 10000
})

// Intercept requests to append authorization data
api.interceptors.request.use(config => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

export default api
