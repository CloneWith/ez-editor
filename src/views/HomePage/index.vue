<template>
  <div>
    <h1 class="head-title">首页</h1>
    <div>
      <!--
      <h2 class="">{{ demoStore.helloPinia }}</h2>
      -->
    </div>

    <div>
      <!--
      class="upload-image"
      -->
      <p>
        <!--
        class="commodity-img"
        -->
        <!--上传图片
            class="box-display"
        -->
        <el-upload
          :on-success="handleSuccess"
          list-type="picture-card"
          :auto-upload="false"
          :on-change="handleChanges"
          :before-remove="beforeRemove"
          :on-preview="handlePictureCardPreview"
          :file-list="fileList "
          multiple
          limit="1"
          name="img"
        >
          <el-icon class="avatar-uploader-icon">
            <Plus/>
          </el-icon>
        </el-upload>
      </p>

      <el-dialog v-model="dialogVisible">
        <img w-full class="image-show" :src="dialogImageUrl" alt="Preview Image"/>
      </el-dialog>
    </div>
    <el-button type="primary" @click="uploadImage">上传图片</el-button>
  </div>
</template>

<script setup lang="ts">
// import {mainStore} from '../../store/index';
/*引入storeToRefs*/
import axios from 'axios';
import {ref} from 'vue';
import type {UploadFile} from 'element-plus';
import {ElMessage, ElMessageBox} from 'element-plus';
import {Plus} from '@element-plus/icons-vue';
//storeToRefs只会关注store中数据，不会对方法进行ref包裹
/*得到countStore*/
// const demoStore = mainStore()

import {HOST, HOST_PORT, ImageUploadUrl, UserAddUrl} from '@/config.ts'

// Send a test add user request to the server to test the connection.
const addUser = async (): Promise<boolean> => {
  let result: boolean = false;
  const formData = new FormData();

  formData.append('username', '12345');
  formData.append('password', '54321');
  const url = `http://${HOST}:${HOST_PORT}/${UserAddUrl}`;
  const method = 'post';

  try {
    await axios({
      method,
      url,
      data: formData,
    });

    result = true;
  } catch (error) {
    console.log(error);
  }

  return result;
}

const testServer = async () => {
  const result = await addUser();
  disabled.value = !result;

  if (!result) {
    ElMessage.error('服务器连接失败，请稍后重试。');
  }
}

testServer();

const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const disabled = ref(false)

const handleRemove = (file: UploadFile) => {
  file.url = ''
  file = null;
}

const handlePictureCardPreview = (file: UploadFile) => {
  dialogImageUrl.value = file.url!
  dialogVisible.value = true
}

const handleDownload = (file: UploadFile) => {
}

const boxDisplay = ref("show-box");
const uploadButton = ref(false);
const fileList = ref([]);

const handleSuccess = () => {
  // Hide the upload button after a successful upload.
  uploadButton.value = true;
}

const handleChanges = img => {
  fileList.value.push(img);
  boxDisplay.value = "hide-box";
}

// 删除
const beforeRemove = () => {
  return new Promise<void>((resolve, reject) => {
    ElMessageBox.confirm("此操作将删除该图片，是否继续？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(() => {
        boxDisplay.value = "show-box";
        resolve();
        fileList.value = [];
        uploadButton.value = false;
      })
      .catch(() => {
        reject(false);
      });
  });
};

const uploadImage = () => {
  // alert("上传图片")
  let formData = new FormData();
  //遍历fileList,为每个文件创建个新的表单字段
  formData.append("username", "12345");
  fileList.value.forEach((file, index) => {
    // 假设后端期望的文件字段名为·fi1e[]'以支持多文件上传
    //如果后端只期望单个文件，则字段名可能只是'i1e·
    //formData.append(file[$index}],file.raw);
    formData.append("file", file.raw);
    console.log(file.raw);
  });

  // Link to access the image upload API
  let url = `http://${HOST}:${HOST_PORT}/${ImageUploadUrl}`
  let method = 'post'
  axios({
    method,
    url,
    data: formData,
    headers: {
      'Content-Type':
        "multipart/form-data" // 确保设置了正确的 Content-Type
    }
  }).then(() => {
    return new Promise<void>((resolve, reject) => {
      try {
        resolve();
        fileList.value = [];
        uploadButton.value = false;
        ElMessage({message: '图片上传成功', type: 'success'});
      }
      catch (_)
      {
        reject(false);
      }
    })
  });
}
</script>

<style scoped>
.main-body {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: block;
}

.head-title {
  filter: drop-shadow(0 0 2em #646cffaa);
  margin: 0;
}
</style>

<style lang="scss" scoped>
/*#在此处编写代码*/
.main-body {
  background: #76cfe5;
}
</style>

<style scoped>
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
