<script setup lang="ts">
import {Button, Panel, Badge} from "primevue";
import em = CSS.em;

const props = defineProps({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  name3: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  status: {
    type: Number,
    required: true
  }
});

function send() {
  window.electron.ipcRenderer.invoke("send", props.email);
}
</script>

<template>
  <Panel>
    <template #header>
      <span class="email">{{email}}</span>
      <Badge :severity="props.status === -1 ? 'danger' : props.status === 0 ? 'info' : 'success'">{{props.status === -1 ? "Не email" : props.status === 0 ? "Не отправлено" : "Отправлено"}}</Badge>
    </template>
    <span>{{props.firstName}} {{props.lastName}} {{props.name3}}</span>
    <div class="buttons">
      <Button @click="send">Отправить</Button>
      <Button @click="send" severity="danger">Удалить</Button>
    </div>
  </Panel>
</template>

<style scoped>
.email {
  font-weight: bold;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  width: 100%;
}
</style>