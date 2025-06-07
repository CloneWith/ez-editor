<template>
  <el-container ref="fileContent" class="main">
    <!-- 图片上传对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      custom-class="upload-dialog"
      title="上传图片"
      width="60%"
    >
      <HomePage/>
    </el-dialog>
    <el-aside class="sidebar">
      <div v-if="userStore.isLoggedIn" class="user-info">
        <span>欢迎，<b>{{ userStore.userInfo?.username }}</b></span>
        <el-button @click="userStore.logout()">退出登录</el-button>
      </div>
      <h2>文档列表</h2>
      <DocumentCard v-for="(item, index) in userDocuments.values()" :key="index" :currentDocument="documentTitle"
                    :text="item" @click="loadDocument"/>
    </el-aside>
    <el-main class="editor">
      <el-container class="editor_card">
        <el-header class="top_toolbar" height="auto">
          <EditorMenu :editor="editor"/>
          <el-button :disabled="historyString === ''" :loading="aiLoading" icon="Brush"
                     @click="polish">
            润色
          </el-button>
          <el-button :disabled="historyString === ''" :loading="aiLoading" icon="EditPen"
                     @click="continuation">
            续写
          </el-button>
          <el-button
            :icon="Upload"
            class="upload-btn"
            type="primary"
            @click="uploadDialogVisible = true"
          >
            上传图片
          </el-button>
        </el-header>

        <el-main class="edit_content">
          <el-input v-model="documentTitle" :onchange="saveEditorContent" placeholder="文档标题"/>
          <editor-content
            :editor="editor"
            @select="onTextSelection"
          />
        </el-main>

        <el-footer class="bottom_bar">
          <el-icon :class="saving ? 'is-loading' : ''">
            <Loading v-if="saving"/>
            <SuccessFilled v-else-if="saveSuccessful"/>
            <WarningFilled v-else/>
          </el-icon>
          {{ saving ? "保存中" : saveSuccessful ? "已保存" : "未保存" }}
          <el-icon>
            <Odometer/>
          </el-icon>
          {{ editor?.storage.characterCount.characters() }}
        </el-footer>
      </el-container>
    </el-main>
    <el-aside class="sidebar">
      <Outline/>
    </el-aside>
  </el-container>
  <el-dialog
    v-model="overrideDialogVisible"
    title="警告"
    width="500"
  >
    <span>当前编辑器内容还未保存，切换文档后，未保存的更改将会丢失。确定吗？</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="overrideDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="overrideDialogVisible = false">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref } from "vue";
import { Upload } from "@element-plus/icons-vue";
import HomePage from "@/views/ImageUpload/index.vue";

// TipTap editor and extensions
import { EditorContent, useEditor } from "@tiptap/vue-3";

import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import BulletList from "@tiptap/extension-bullet-list";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import Image from "@tiptap/extension-image";

import { ElDialog, ElMessage, ElMessageBox } from "element-plus";

// Code Highlight
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import { createLowlight } from "lowlight";

import EditorMenu from "./EditorMenu/index.vue";
import Outline from "./Outline/index.vue";
import DocumentCard from "./DocumentCard/index.vue";
import api from "@/utils/api.ts";
import {
  DocumentUploadUrl,
  GetContinuationUrl,
  GetDocumentListUrl,
  GetDocumentUrl,
  GetPolishUrl,
} from "@/config.ts";
import { Base64 } from "js-base64";
import { useEditorStore } from "@/stores/editor.ts";
import { useUserStore } from "@/stores/user.ts";

const lowlight = createLowlight();
lowlight.register({html, ts, css, js});

const documentTitle = ref("");
const aiList = ref([]);
const aiLoading = ref(false);
const aiPolishContent = ref("");
const aiContinuationContent = ref("");
const fileContent = ref(null);
const historyString = ref("");
const saveTimer = ref<NodeJS.Timeout>();

const saving = ref(false);
const saveSuccessful = ref(true);
const overrideDialogVisible = ref(false);
const allowOverride = ref(false);

const userDocuments = ref<string[]>([]);

const editorStore = useEditorStore();
const userStore = useUserStore();

let selection: any;

// Use AI for text polishment
const polish = () => {
  aiLoading.value = true;
  api.postForm(GetPolishUrl, {
    cont: historyString,
  }).then((res) => {
    console.log(res.data);
    const tpcard1 = {title: "AI润色", cont: historyString, review: res.data};
    aiList.value.push(tpcard1);

    if (res.data.success === true) {
      aiPolishContent.value = res.data.answer;
      ElMessageBox.alert(res.data.answer, "AI润色");
    } else {
      ElMessage.error(`获取润色结果失败 (${res.data.message})`);
    }

    aiLoading.value = false;
  }).catch((err) => {
    console.error("Error getting continuation", err);
    ElMessage.error("获取润色结果失败...");
    aiLoading.value = false;
  });
};

// Use AI for text continuation
const continuation = () => {
  aiLoading.value = true;
  api.postForm(GetContinuationUrl, {
    cont: historyString,
  }).then((res) => {
    console.log(res.data);

    if (res.data.success === true) {
      aiContinuationContent.value = res.data.answer;
      ElMessageBox.alert(res.data.answer, "AI续写");
    } else {
      ElMessage.error(`获取续写结果失败 (${res.data.message})`);
    }

    aiLoading.value = false;
  }).catch((err) => {
    console.error("Error getting continuation", err);
    ElMessage.error("获取续写结果失败...");
    aiLoading.value = false;
  });
};

const onTextSelection = () => {
  selection = window.getSelection();
  if (selection != null && historyString != selection) {
    const content = selection.toString();
    if (content != "" && fileContent.value != null) {
      historyString.value = content;
    }
  } else {
    historyString.value = "";
  }
};

const saveEditorContent = () => {
  if (editor.value === undefined || documentTitle.value.trim() === "") {
    saving.value = false;
    saveSuccessful.value = false;
    return;
  }

  saving.value = true;

  const content = Base64.encode(editor.value.getHTML());

  if (content != null) {
    api.postForm(DocumentUploadUrl, {
      document: content,
      title: documentTitle.value.trim(),
    }).then(() => {
      saveSuccessful.value = true;
    }).catch((err) => {
      console.error("Error saving document", err);
      saveSuccessful.value = false;
    });
  }

  saving.value = false;
  loadDocumentList();
};

const loadDocument = (title: string) => {
  if ((saveSuccessful.value === false || saving.value === true) && !allowOverride.value) {
    ElMessage.warning("当前文档未保存，请在保存后再试。3秒内再次点击可忽略此警告并强制加载。");
    allowOverride.value = true;
    setTimeout(() => {
      allowOverride.value = false;
    }, 3000);
    return;
  }

  api.get(GetDocumentUrl, {
    params: {
      title: title,
    },
  }).then((res) => {
    if (res.data.success === true) {
      editor.value?.commands.setContent(res.data.content);
      documentTitle.value = res.data.title;

      saveSuccessful.value = true;
      saving.value = false;
      loadHeadings();

      if (allowOverride.value)
        allowOverride.value = false;
    } else {
      ElMessage.error("文档加载失败...");
    }
  });
};

const loadDocumentList = () => {
  api.get(GetDocumentListUrl)
    .then(res => {
      userDocuments.value = [];
      res.data.documents.forEach((doc: string) => {
        userDocuments.value.push(doc);
      });
    });
};

loadDocumentList();

// 加载headings
const loadHeadings = () => {
  const headings = [] as any[];
  if (!editor.value) return;
  const transaction = editor.value.state.tr;
  if (!transaction) return;
  editor.value?.state.doc.descendants((node, pos) => {
    if (node.type.name === "heading") {
      console.log(pos, node);
      const start = pos;
      const end = pos + node.content.size;
      const id = `heading-${headings.length + 1}`;
      if (node.attrs.id !== id) {
        transaction?.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          id,
        });
      }

      headings.push({
        level: node.attrs.level,
        text: node.textContent,
        start,
        end,
        id,
      });
    }
  });

  transaction?.setMeta("addToHistory", false);
  transaction?.setMeta("preventUpdate", true);

  editor.value?.view.dispatch(transaction);
  editorStore.setHeadings(headings);
};

// 使用ref创建可变的响应式引用
// 编辑器初始化
const uploadDialogVisible = ref(false);

const editor = useEditor({
  content: ``,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5],
      },
    }),
    Image,
    Underline,
    TaskList,
    TaskItem,
    Highlight,
    Placeholder.configure({
      placeholder: "在这里输入文本",
    }),
    OrderedList,
    BulletList,
    ListItem,
    CharacterCount.configure({
      limit: 10000,
    }),
  ],
  onUpdate() {
    clearTimeout(saveTimer.value);
    saveTimer.value = setTimeout(() => {
      saveEditorContent();
      loadHeadings();
      editorStore.setEditorInstance(editor.value);
    }, 500);
  },
  onCreate() {
    loadHeadings();
    editorStore.setEditorInstance(editor.value);
  },
  onSelectionUpdate() {
    onTextSelection();
  },
  injectCSS: false,
});

onBeforeUnmount(() => {
  clearTimeout(saveTimer.value);
});

</script>

<style>
.main {
  height: 100vh;
  align-content: center;
  overflow: hidden;
}

.sidebar {
  height: 100%;
  width: 20%;
  min-width: 64px;
}

.user-info {
  position: absolute;
  top: 20px;
  right: 20px;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
}

.editor {
  height: 100%;
  min-width: 300px;
}

.editor_card {
  position: relative;
  width: 95%;
  height: 95%;
  left: 2.5%;
  top: 2.5%;
  display: grid;
  grid-template-rows: auto 90% auto;
  border: 1px solid #4f5c5765;
}

.top_toolbar {
  border-bottom: 1px dashed #9ca19f65;
  align-content: center;
}

.bottom_bar {
  border-top: 1px dashed #9ca19f65;
  min-height: 32px;
  height: 100%;
  width: 100%;
  display: flex;
  column-gap: 5px;
  align-items: center;
}

.edit_content {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>

<style lang="scss">
.upload-dialog {
  .el-dialog__body {
    padding: 0;
  }

  .main-body {
    padding: 20px;
    height: auto;
    background: #1a1b1e;
  }
}

b {
  font-weight: bold;
}

.ProseMirror {
  overflow-y: scroll;
}

.ProseMirror p {
  margin: 0;
}

.ProseMirror:focus {
  outline: none;
}

.tiptap p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.tiptap {
  > * + * {
    margin-top: 0.75em;
  }

  ul {
    padding: 0 2rem;
    list-style: square;
  }

  ol {
    padding: 0 2rem;
    list-style: decimal;
  }

  table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    margin: 0;
    overflow: hidden;

    td,
    th {
      min-width: 1em;
      border: 2px solid #ced4da;
      padding: 3px 5px;
      vertical-align: top;
      box-sizing: border-box;
      position: relative;

      > * {
        margin-bottom: 0;
      }
    }

    th {
      font-weight: bold;
      text-align: left;
      background-color: #f1f3f5;
    }

    .selectedCell:after {
      z-index: 2;
      position: absolute;
      content: '';
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(200, 200, 255, 0.4);
      pointer-events: none;
    }

    .column-resize-handle {
      position: absolute;
      right: -2px;
      top: 0;
      bottom: -2px;
      width: 4px;
      background-color: #adf;
      pointer-events: none;
    }

    p {
      margin: 0;
    }
  }

  pre {
    background: #0d0d0d;
    color: #fff;
    font-family: 'JetBrainsMono', monospace;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;

    code {
      color: inherit;
      padding: 0;
      background: none;
      font-size: 0.8rem;
    }

    .hljs-comment,
    .hljs-quote {
      color: #616161;
    }

    .hljs-variable,
    .hljs-template-variable,
    .hljs-attribute,
    .hljs-tag,
    .hljs-name,
    .hljs-regexp,
    .hljs-link,
    .hljs-name,
    .hljs-selector-id,
    .hljs-selector-class {
      color: #f98181;
    }

    .hljs-number,
    .hljs-meta,
    .hljs-built_in,
    .hljs-builtin-name,
    .hljs-literal,
    .hljs-type,
    .hljs-params {
      color: #fbbc88;
    }

    .hljs-string,
    .hljs-symbol,
    .hljs-bullet {
      color: #b9f18d;
    }

    .hljs-title,
    .hljs-section {
      color: #faf594;
    }

    .hljs-keyword,
    .hljs-selector-tag {
      color: #70cff8;
    }

    .hljs-emphasis {
      font-style: italic;
    }

    .hljs-strong {
      font-weight: 700;
    }
  }
}

.tableWrapper {
  overflow-x: auto;
}

.resize-cursor {
  cursor: ew-resize;
}
</style>
