<script setup lang="ts">
import {Badge, Button, Dialog, Panel} from "primevue";
import {ref} from "vue";

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
  },
  uuid: {
    type: String,
    required: true
  }
});

function send() {
  window.electron.ipcRenderer.invoke("send", props.uuid);
}

function rm() {
  window.electron.ipcRenderer.invoke("rm", props.uuid);
}

const preview = ref<{data: string, sender: string, subject: string} | undefined>(undefined);
const dialogVisible= ref(false);

async function getPreview() {
  preview.value = await window.electron.ipcRenderer.invoke("preview", props.uuid);
  dialogVisible.value = true;
}
</script>

<template>
  <Panel>
    <template #header>
      <div class="header">
        <span class="email">{{email}}</span>
        <Badge :severity="props.status < 0 ? 'danger' : props.status === 0 ? 'info' : props.status === 1 ? 'success' : 'warn'">
          {{props.status === -2 ? "Ошибка при отправке" : props.status === -1 ? "Не email" : props.status === 0 ? "Не отправлено" : props.status === 1 ? "Отправлено" : "Отправляется"}}
        </Badge>
      </div>
    </template>
    <span class="text">{{props.firstName}} {{props.lastName}} {{props.name3}}</span>
    <div class="buttons">
      <Button @click="getPreview">Предпросмотр</Button>
      <Button @click="send" v-if="status === 0 || status === -2">Отправить</Button>
      <Button @click="rm" severity="danger">Удалить</Button>
    </div>
    <Dialog v-model:visible="dialogVisible" v-if="preview">
      <template #header>
        <p class="dialogHeader">
          Отправитель: {{ preview.sender }}
          <br>
          Получатель: {{ email }}
          <br>
          Тема: {{ preview.subject }}
        </p>
      </template>
      <div v-html="preview.data" class="message"/>
    </Dialog>
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

.message {
  background: white;
  border-radius: 20px;
  padding: 10px;
  color: black;
}

.message :deep(strong) {
  font-weight: bold;
}

.message :deep(blockquote) {
  border-left: 3px solid gray;
  margin: 1.5rem 0;
  padding-left: 1rem;
}
</style>