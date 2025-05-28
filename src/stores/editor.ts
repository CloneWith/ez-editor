import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Editor } from '@tiptap/vue-3'

export const useEditorStore = defineStore('editor', () => {
  const headings = ref<any[]>([])
  const activeHeading = ref()
  const editorInstance = ref<Editor>()

  function setHeadings(newHeadings: any[]) {
    headings.value = newHeadings
  }

  function setActiveHeading(newHeading: any) {
    activeHeading.value = newHeading
  }

  function setEditorInstance(editor: Editor) {
    editorInstance.value = editor
  }

  return {
    headings,
    activeHeading,
    editorInstance,
    setHeadings,
    setActiveHeading,
    setEditorInstance
  }
})
