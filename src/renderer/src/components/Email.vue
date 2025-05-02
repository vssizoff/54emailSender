<script setup lang="ts">
import { Badge, Button, Panel } from "primevue";

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

function rm() {
  window.electron.ipcRenderer.invoke("rm", props.email);
}
</script>

<template>
  <Panel>
    <template #header>
      <div class="header">
        <span class="email">{{email}}</span>
        <Badge :severity="props.status === -1 ? 'danger' : props.status === 0 ? 'info' : 'success'">{{props.status === -1 ? "Не email" : props.status === 0 ? "Не отправлено" : "Отправлено"}}</Badge>
      </div>
    </template>
    <span class="text">{{props.firstName}} {{props.lastName}} {{props.name3}}</span>
    <div class="buttons">
      <Button @click="send" v-if="status === 0">Отправить</Button>
      <Button @click="rm" severity="danger">Удалить</Button>
    </div>
  </Panel>
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