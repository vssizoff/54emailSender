<script setup lang="ts">
import { Badge, Button, Panel } from "primevue";
import { ref, watch } from "vue";
import TemplateConfigDialog from "@renderer/components/TemplateConfigDialog.vue";

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  index: {
    type: Number,
    required: true
  }
});

const editorVisible = ref<boolean>(false);
const editorName = ref<string>(props.name);
const editorSender = ref<string>(props.sender);
const editorSubject = ref<string>(props.subject);
const editorData = ref<string>("");

function select() {
  window.electron.ipcRenderer.invoke("selectTemplate", props.index);
}

function rm() {
  window.electron.ipcRenderer.invoke("removeTemplate", props.index);
}

function editEmailConfig() {
  window.electron.ipcRenderer.invoke("editTemplate", props.index, editorName.value, editorSender.value, editorSubject.value, editorData.value);
  editorVisible.value = false;
  editorName.value = props.name;
  editorSender.value = props.sender;
  editorSubject.value = props.subject;
  editorData.value = "";
}

function openEditor() {
  window.electron.ipcRenderer.invoke("getTemplate", props.index).then(data => {
    if (typeof data !== "string") return;
    editorData.value = data;
    editorVisible.value = true;
  });
}

watch(props, value => {
  if (!editorVisible.value) {
    editorName.value = value.name;
    editorSender.value = value.sender;
    editorSubject.value = value.subject;
  }
});
</script>

<template>
  <Panel>
    <template #header>
      <div class="header">
        <span class="name">{{name}}</span>
        <Badge severity="success" v-if="selected">Выбрано</Badge>
      </div>
    </template>
    <div class="buttons">
      <Button @click="select" :disabled="selected">Выбрать</Button>
      <Button @click="openEditor">Изменить</Button>
      <Button @click="rm" severity="danger">Удалить</Button>
    </div>
  </Panel>
  <TemplateConfigDialog v-model:name="editorName" v-model:sender="editorSender" v-model:subject="editorSubject" v-model:data="editorData" v-model:visible="editorVisible">
    <Button severity="success" @click="editEmailConfig">Изменить</Button>
  </TemplateConfigDialog>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.name {
  font-weight: bold;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  width: 100%;
}
</style>