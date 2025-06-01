import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from "@/utils/api.ts";

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(!!localStorage.getItem('token'))
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const token = ref(localStorage.getItem('token') || '')

  async function login(username: string, password: string) {
    try {
      const response = await api.post('/login', {
        username,
        password
      })

      const data = response.data
      isLoggedIn.value = true
      userInfo.value = data.user
      token.value = data.token

      // Store auth data in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('userInfo', JSON.stringify(data.user))

      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  function logout() {
    isLoggedIn.value = false
    userInfo.value = null
    token.value = ''

    // Clear auth data from localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    isLoggedIn,
    userInfo,
    token,
    login,
    logout
  }
})
