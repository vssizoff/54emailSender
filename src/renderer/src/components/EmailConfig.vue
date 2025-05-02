<script setup lang="ts">
import { Badge, Button, Panel } from "primevue";
import type { EmailConfigType } from "@renderer/types.js";
import { type PropType, ref } from "vue";
import EmailConfigDialog from "@renderer/components/EmailConfigDialog.vue";

const props = defineProps({
  email: {
    type: Object as PropType<EmailConfigType>,
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
const editorEmailConfig = ref<EmailConfigType | null>(props.email);

function select() {
  window.electron.ipcRenderer.invoke("selectEmail", props.index);
}

function rm() {
  window.electron.ipcRenderer.invoke("removeEmail", props.index);
}

function editEmailConfig() {
  window.electron.ipcRenderer.invoke("editEmail", props.index, JSON.parse(JSON.stringify(editorEmailConfig.value)));
  editorVisible.value = false;
}
</script>

<template>
  <Panel>
    <template #header>
      <div class="header">
        <span class="email">{{email.mailUser}}</span>
        <Badge severity="success" v-if="selected">Выбрано</Badge>
      </div>
    </template>
    <span class="text">{{props.email.mailHost}}</span>
    <div class="buttons">
      <Button @click="select" v-if="!selected">Выбрать</Button>
      <Button @click="editorVisible = true">Изменить</Button>
      <Button @click="rm" severity="danger">Удалить</Button>
    </div>
  </Panel>
  <EmailConfigDialog v-model:email="editorEmailConfig" v-model:visible="editorVisible">
    <Button severity="success" @click="editEmailConfig">Изменить</Button>
  </EmailConfigDialog>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.email {
  font-weight: bold;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  width: 100%;
}

.text {
  text-align: left;
  display: inline-block;
  width: 100%;
}
</style>