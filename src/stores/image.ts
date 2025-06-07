import { ref } from "vue";
import { defineStore } from "pinia";

export const useImageStore = defineStore("images", () => {
  const uploadedImages = ref<string[]>([]);

  function addImage(src: string) {
    uploadedImages.value.push(src);
  }

  return {
    uploadedImages,
    addImage,
  };
});
