<template>
  <div class="main-body">

    <h1 class="head-title">首页</h1>
    <el-alert
      :class="backendReachable ? 'hide-box' : 'show-box'"
      :closable="false"
      show-icon
      title="后端服务器连接失败"
      type="warning"
    >
      将无法上传图片，请稍后再试。
      <el-button @click="testServer">重试</el-button>
    </el-alert>
    <div class="upload-image">
      <p>
        <el-upload
          :auto-upload="false"
          :before-remove="beforeRemove"
          :before-upload="beforeUpload"
          :disabled="uploadDisabled"
          :file-list="fileList"
          :limit="10"
          :on-change="handleChanges"
          :on-error="handleError"
          :on-preview="handlePictureCardPreview"
          :on-progress="handleUploading"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
          list-type="picture-card"
          multiple
          name="img"
        >
          <el-icon class="avatar-uploader-icon">
            <Plus/>
          </el-icon>
        </el-upload>
      </p>

      <el-dialog v-model="dialogVisible">
        <img :src="dialogImageUrl" alt="Preview Image" class="image-show" w-full/>
      </el-dialog>
    </div>
    <div class="buttons">
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
      <el-button
        :disabled="submitDisabled || fileList.length == 0 || editorStore.editorInstance === undefined"
        :icon="EditPen"
        @click="uploadImage(insertImageToEditor)"
      >
        插入编辑器
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import type { UploadFile } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { EditPen, Loading, Plus, Upload } from "@element-plus/icons-vue";

import { ImageUploadUrl, TestUrl } from "@/config.ts";
import api from "@/utils/api.ts";
import { useImageStore } from "@/stores/image.ts";
import { useEditorStore } from "@/stores/editor.ts";


const userStore = useUserStore();
const imageStore = useImageStore();
const editorStore = useEditorStore();

const testServer = async () => {
  let result: boolean = false;

  await api.get(TestUrl).then((res) => {
    result = res.status === 200;
  })
    .catch((error) => {
      console.error("Exception thrown in connectivity testing:", error);
    });

  backendReachable.value = result;
  uploadDisabled.value = !result || !userStore.isLoggedIn;

  if (!result) {
    ElMessage.error("服务器连接失败，请稍后重试。");
  }
};

testServer();

const dialogImageUrl = ref("");
const dialogVisible = ref(false);
const uploadInProgress = ref(false);
const uploadDisabled = ref(false);
const backendReachable = ref(true);

const handlePictureCardPreview = (file: UploadFile) => {
  dialogImageUrl.value = file.url!;
  dialogVisible.value = true;
};

const boxDisplay = ref("show-box");
const submitDisabled = ref(false);
const fileList = ref<UploadFile[]>([]);

const handleUploading = () => {
  submitDisabled.value = true;
  uploadDisabled.value = true;
};

const handleSuccess = () => {
  // Hide the upload button after a successful upload.
  submitDisabled.value = true;
  uploadDisabled.value = false;
};

const handleError = () => {
  ElMessage.error("发生了错误...");
};

const handleChanges = (file: UploadFile) => {
  fileList.value.push(file);
  boxDisplay.value = "hide-box";
};

// Remove the selected files from the list.
const handleRemove = (file: UploadFile) => {
  fileList.value = fileList.value.filter((f: UploadFile) => f.uid !== file.uid);
  if (fileList.value.length === 0) {
    boxDisplay.value = "show-box";
  }
};

const beforeUpload = (file: UploadFile) => {
};

// Ask the user before the removal.
const beforeRemove = () => {
  return new Promise<void>((resolve, reject) => {
    ElMessageBox.confirm("此操作将删除该图片，是否继续？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        boxDisplay.value = "show-box";
        resolve();
      })
      .catch((error) => {
        console.error(error);
        reject(false);
      });
  });
};



const uploadImage = (onSuccess: (Function | undefined) = undefined) => {
  if (!userStore.isLoggedIn) return;

  const formData = new FormData();
  fileList.value.forEach((file: UploadFile) => {
    formData.append("file", file.raw!);
    console.log(file.raw);
  });

  api.postForm(ImageUploadUrl, formData).then((res) => {
    imageStore.addImage(res.data.url);

    if (onSuccess !== undefined)
      onSuccess();

    return new Promise<void>((resolve, reject) => {
      try {
        resolve();
        fileList.value = [];
        submitDisabled.value = false;
        ElMessage({message: "图片上传成功", type: "success"});
      } catch (error) {
        console.error(error);
        reject(false);
      }
    });
  });
};

const insertImageToEditor = () => {
  if (editorStore.editorInstance === undefined)
    return;

  imageStore.uploadedImages.forEach((src: string) => {
    editorStore.editorInstance.commands.insertContent({
      type: "image",
      attrs: {
        src: src,
      },
    });
  });

  imageStore.uploadedImages.value = [];
};
</script>

<style scoped>
.main-body {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.buttons {
  display: flex;
  flex-direction: row;
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
