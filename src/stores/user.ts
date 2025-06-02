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

      if (data.success) {
        isLoggedIn.value = true
        userInfo.value = data.user
        token.value = data.token

        // Store auth data in localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('userInfo', JSON.stringify(data.user))

        return {
          success: true,
          reason: "",
        }
      }
      else {
        return {
          success: false,
          reason: "用户名或密码错误",
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        reason: "服务器错误",
      }
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
