<template>
  <div class="EditMain" ref="fileContent" @mousedown="hideMenu()">
    <ul
      @mousedown="showMenu()"
      v-show="menuVisible"
      :style="{
        left: position.left + 'px',
        top: position.top + 'px',
        display: menuVisible ? 'grid' : 'none',
      }"
      class="contextmenu"
    >
      <li class="item" @click="polish()">
        <el-icon>
          <Brush />
        </el-icon>
        润色
      </li>
      <li class="item" @click="continuation()">
        <el-icon>
          <EditPen />
        </el-icon>
        续写
      </li>
    </ul>
    <div class="left_sidebar"></div>
    <div class="editor">
      <div class="editor_card">
        <div class="top_toolbar">
          <EditorMenu :editor="editor" />
        </div>
        <div class="edit_content">
          <EditorContent
            @scroll="onScroll()"
            @mousedown="hideMenu()"
            @mousemove="onMouseMove()"
            @mouseup="onTextSelection($event)"
            style="padding: 8px; overflow-y: auto"
            :editor="editor"
          />
        </div>

        <div class="bottom_bar">
          字数统计:
          {{ editor?.storage.characterCount.characters() }}
        </div>
      </div>
    </div>

    <div class="right_sidebar">
      <Outline></Outline>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Brush, EditPen } from '@element-plus/icons-vue'
import { ref } from 'vue'

// TipTap editor and extensions
import { EditorContent, useEditor } from '@tiptap/vue-3'

import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Underline from '@tiptap/extension-underline'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import BulletList from '@tiptap/extension-bullet-list'
import Highlight from '@tiptap/extension-highlight'
import CharacterCount from '@tiptap/extension-character-count'

// Code Highlight
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import { createLowlight } from 'lowlight'

import EditorMenu from './EditorMenu/index.vue'
import Outline from './Outline/index.vue'

import { useEditorStore } from '@/stores/editor'
import axios from 'axios'

const lowlight = createLowlight()
lowlight.register({ html, ts, css, js })

const aiList = ref([])
const aiLoading = ref(false)
const aiPolishContent = ref('')
const aiContinuationContent = ref('')
const fileContent = ref(null)

const menuVisible = ref(false)
const position = ref({
  top: 0,
  left: 0,
})
const mouseMoved = ref(false)
let historyString: string
let selection: any

// Use AI for text polishment
const polish = () => {
  aiLoading.value = true
  menuVisible.value = false
  const formData = new FormData()
  formData.append('username', '123456')
  formData.append('key', 'xxxxxxx')
  formData.append('cont', historyString)
  const url = 'http://127.0.0.1:5000/getpolish' //访问后端接口的url
  const method = 'post'
  axios({
    method,
    url,
    data: formData,
  }).then((res) => {
    console.log(res.data)
    const tpcard1 = { title: 'ai辅助评审', cont: historyString, review: res.data }
    aiList.value.push(tpcard1)
    navigator.clipboard.writeText(res.data)
    // showMessage()
    aiLoading.value = false
  })
}

// Use AI for text continuation
const continuation = () => {
  aiLoading.value = true
  menuVisible.value = false
  const formData = new FormData()

  // TODO: Integrate with backend API
  formData.append('username', '123456')
  formData.append('key', 'xxxxxxx')
  formData.append('cont', historyString)
  const url = 'http://127.0.0.1:5000/getpolish' //访问后端接口的url
  const method = 'post'
  axios({
    method,
    url,
    data: formData,
  }).then((res) => {
    console.log(res.data)
    aiLoading.value = false
  })
}

const onTextSelection = (e: MouseEvent) => {
  selection = window.getSelection()
  if (selection != null && historyString != selection) {
    const content = selection.toString()
    if (content != '' && fileContent.value != null) {
      menuVisible.value = true

      position.value.top = e.clientY
      position.value.left = e.clientX
      historyString = content
    }
  } else {
    historyString = ''
  }
}

const onMouseMove = () => {
  mouseMoved.value = true
}

const hideMenu = () => {
  menuVisible.value = false
}

const showMenu = () => {
  menuVisible.value = true
}

const onScroll = () => {
  menuVisible.value = false
  // window.getSelection().removeAllRanges()
}

const editorStore = useEditorStore()
// 加载headings
const loadHeadings = () => {
  const headings = [] as any[]
  if (!editor.value) return
  const transaction = editor.value.state.tr
  if (!transaction) return
  editor.value?.state.doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      console.log(pos, node)
      const start = pos
      const end = pos + node.content.size
      // const end = pos + node
      const id = `heading-${headings.length + 1}`
      if (node.attrs.id !== id) {
        transaction?.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          id,
        })
      }

      headings.push({
        level: node.attrs.level,
        text: node.textContent,
        start,
        end,
        id,
      })
    }
  })

  transaction?.setMeta('addToHistory', false)
  transaction?.setMeta('preventUpdate', true)

  editor.value?.view.dispatch(transaction)
  editorStore.setHeadings(headings)
}

// 使用ref创建可变的响应式引用
// 编辑器初始化
const editor = useEditor({
  content: ``,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5],
      },
    }),
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
    loadHeadings()
    editorStore.setEditorInstance(editor.value)
  },
  onCreate() {
    loadHeadings()
    editorStore.setEditorInstance(editor.value)
  },
  injectCSS: false,
})

</script>

<style>
.EditMain {
  position: relative;
  width: 100vw;
  height: 100vh;

  display: grid;
  grid-template-columns: 20% 60% 20%;
}

.left_sidebar {
  background-color: rgb(111 118 177 / 60%);
  height: 100%;
  width: 100%;
}

.right_sidebar {
  background-color: rgb(206 226 117);
  height: 100%;
  width: 100%;
}

.editor_card {
  position: relative;
  width: 95%;
  height: 95%;
  left: 2.5%;
  top: 2.5%;
  display: grid;
  grid-template-rows: 5% 92% 3%;
  border: 1px solid #4f5c5765;
}

.top_toolbar {
  background-color: rgba(207, 220, 245, 0.199);
  border-bottom: 1px dashed #9ca19f65;
}

.bottom_bar {
  background-color: rgba(207, 220, 245, 0.199);
  border-top: 1px dashed #9ca19f65;
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 100%;
  justify-items: center;
  align-items: center;
}

.edit_content {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

<style lang="scss">
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

.contextmenu {
  width: 120px;
  margin: 0;
  background: #fff;
  z-index: 3000;
  position: absolute;
  list-style-type: none;
  padding: 5px 5px 5px 15px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.3);
  display: grid;
  grid-template-columns: 50% 50%;
}

.contextmenu .item {
  height: 35px;
  width: 100%;
  line-height: 35px;
  color: rgb(29, 33, 41);
  cursor: pointer;
}

.contextmenu .item {
  height: 35px;
  width: 100%;
  line-height: 35px;
  color: rgb(29, 33, 41);
  cursor: pointer;
}

.contextmenu .item:hover {
  background: rgb(229, 230, 235);
}
</style>

<style lang="less" scoped>
.contextmenu {
  width: 180px;
  margin: 0;
  background: #fff;
  z-index: 3000;
  position: absolute;
  list-style-type: none;
  padding: 5px 5px 5px 15px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
  display: grid;
  grid-template-columns: 50% 50%;

  .item {
    height: 35px;
    width: 100%;
    line-height: 35px;
    color: rgb(29, 33, 41);
    cursor: pointer;
  }

  .item:hover {
    background: rgb(229, 230, 235);
  }
}
</style>
