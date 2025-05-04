<script setup lang="ts">
import { Dialog, FloatLabel, InputText, Button } from "primevue";
import { ref, watch } from "vue";
import TextArea from "@renderer/components/TextArea.vue";

const props = defineProps({
  name: {
    type: String,
    default: ""
  },
  data: {
    type: String,
    default: ""
  },
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits({
  "update:name": (_: string) => true,
  "update:data": (_: string) => true,
  "update:visible": (_: boolean) => true
});

const name = ref<string>(props.name),
  data = ref<string>(props.data);

watch(name, value => emit("update:name", value));
watch(data, value => emit("update:data", value));
watch(props, value => {
  name.value = value.name;
  data.value = value.data;
});

async function readFile() {
  data.value = await window.electron.ipcRenderer.invoke("readFile", "Выберите файл шаблона", [
    {name: 'Template Files', extensions: ["html", "txt"]},
    {name: 'All Files', extensions: ["*"]}
  ]);
}
</script>

<template>
  <Dialog :visible="visible" @update:visible="emit('update:visible', $event)">
    <div class="dialog">
      <FloatLabel variant="on">
        <InputText id="name" v-model="name" autocomplete="off"/>
        <label for="name">Название</label>
      </FloatLabel>
      <p>
        %firstName% - Имя<br>
        %lastName% - Фамилия<br>
        %name3% - Отчество<br>
        %email% - Email получателя<br>
        %mailUser% - Email отправителя<br>
      </p>
      <Button @click="readFile">Выбрать файл</Button>
      <FloatLabel variant="on">
        <TextArea id="data" v-model="data"/>
        <label for="data">Содержание</label>
      </FloatLabel>
      <slot/>
    </div>
  </Dialog>
</template>

<style scoped>
.dialog {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.secure {
  display: flex;
  div {
    margin-left: 10px;
  }
}
</style>