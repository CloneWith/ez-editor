<template>
  <div class="main-body">
    <h1 class="head-title">首页</h1>
    <el-alert
      :class="backendReachable ? 'hide-box' : 'show-box'"
      title="后端服务器连接失败"
      type="warning"
      :closable="false"
      show-icon
    >
      将无法上传图片，请稍后再试。
      <el-button @click="testServer">重试</el-button>
    </el-alert>
    <div class="upload-image">
      <p>
        <!--
        class="commodity-img"
        -->
        <!--上传图片
            class="box-display"
        -->
        <el-upload
          :auto-upload="false"
          :before-remove="beforeRemove"
          :before-upload="beforeUpload"
          :disabled="uploadDisabled"
          :file-list="fileList"
          :limit="10"
          :on-remove="handleRemove"
          :on-change="handleChanges"
          :on-error="handleError"
          :on-preview="handlePictureCardPreview"
          :on-progress="handleUploading"
          :on-success="handleSuccess"
          list-type="picture-card"
          multiple
          name="img"
        >
          <el-icon class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </p>

      <el-dialog v-model="dialogVisible">
        <img :src="dialogImageUrl" alt="Preview Image" class="image-show" w-full />
      </el-dialog>
    </div>
    <el-button
      :disabled="submitDisabled || fileList.length == 0"
      :icon="Upload"
      :loading="uploadInProgress"
      :loading-icon="Loading"
      type="primary"
      @click="uploadImage"
    >
      上传图片
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import axios from 'axios'
import { ref } from 'vue'
import type { UploadFile } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading, Plus, Upload } from '@element-plus/icons-vue'

import { HOST, HOST_PORT, ImageUploadUrl, UserAddUrl } from '@/config.ts'

// Send a test add user request to the server to test the connection.
const addUser = async (): Promise<boolean> => {
  let result: boolean = false
  const formData = new FormData()

  formData.append('username', '12345')
  formData.append('password', '54321')
  const url = `http://${HOST}:${HOST_PORT}/${UserAddUrl}`
  const method = 'post'

  try {
    await axios({
      method,
      url,
      data: formData,
    })

    result = true
  } catch (error) {
    console.log(error)
  }

  return result
}

const testServer = async () => {
  const result = await addUser()
  backendReachable.value = result
  uploadDisabled.value = !result

  if (!result) {
    ElMessage.error('服务器连接失败，请稍后重试。')
  }
}

testServer()

const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const uploadInProgress = ref(false)
const uploadDisabled = ref(false)
const backendReachable = ref(true)

const handlePictureCardPreview = (file: UploadFile) => {
  dialogImageUrl.value = file.url!
  dialogVisible.value = true
}

const boxDisplay = ref('show-box')
const submitDisabled = ref(false)
const fileList = ref<UploadFile[]>([])

const handleUploading = () => {
  submitDisabled.value = true
  uploadDisabled.value = true
}

const handleSuccess = () => {
  // Hide the upload button after a successful upload.
  submitDisabled.value = true
  uploadDisabled.value = false
}

const handleError = () => {
  ElMessage.error('发生了错误...')
}

const handleChanges = (file: UploadFile) => {
  fileList.value.push(file)
  boxDisplay.value = 'hide-box'
}

// Remove the selected files from the list.
const handleRemove = (file: UploadFile) => {
  fileList.value = fileList.value.filter((f: UploadFile) => f.uid !== file.uid)
  if (fileList.value.length === 0) {
    boxDisplay.value = 'show-box'
  }
}

const beforeUpload = (file: UploadFile) => {}

// Ask the user before the removal.
const beforeRemove = () => {
  return new Promise<void>((resolve, reject) => {
    ElMessageBox.confirm('此操作将删除该图片，是否继续？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        boxDisplay.value = 'show-box'
        resolve()
      })
      .catch(() => {
        reject(false)
      })
  })
}

const uploadImage = () => {
  const formData = new FormData()
  // 遍历fileList 为每个文件创建个新的表单字段
  formData.append('username', '12345')
  fileList.value.forEach((file: UploadFile) => {
    formData.append('file', file.raw!)
    console.log(file.raw)
  })

  // Link to access the image upload API
  const url = `http://${HOST}:${HOST_PORT}/${ImageUploadUrl}`
  const method = 'post'
  axios({
    method,
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data', // 确保设置了正确的 Content-Type
    },
  }).then(() => {
    return new Promise<void>((resolve, reject) => {
      try {
        resolve()
        fileList.value = []
        submitDisabled.value = false
        ElMessage({ message: '图片上传成功', type: 'success' })
      } catch (_) {
        reject(false)
      }
    })
  })
}
</script>

<style scoped>
.main-body {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #1a1b1e;
}

.head-title {
  filter: drop-shadow(0 0 2em #646cffaa);
  margin: 0;
}

.hide-box {
  display: none;
}

.show-box {
  display: inline-flex;
}

.image-show {
  width: 100%;
  height: 100%;
  object-fit: fill;
}
</style>
