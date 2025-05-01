<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Entry } from "@renderer/types.js";
import Email from "@renderer/components/Email.vue";
import {Button} from "primevue";

const emails = ref<Array<Entry>>([]);

onMounted(() => {
  window.electron.ipcRenderer.on("set", (_, newEmails: Array<Entry>) => emails.value = newEmails);
  window.electron.ipcRenderer.on("status", (_, [searchEmail, status]) => {
    emails.value = emails.value.map(entry => {
      if (entry.email === searchEmail) return {...entry, status};
      return entry;
    });
  });
});

function selectFile() {
  window.electron.ipcRenderer.send("selectFile");
}

function send() {
  window.electron.ipcRenderer.invoke("sendAll");
}
</script>

<template>
  <div class="buttons">
    <Button @click="selectFile">Выбрать таблицу</Button>
    <Button @click="send">Отправить неотправленные</Button>
  </div>
  <Email v-for="{email, firstName, lastName, name3, status} in emails" :email="email" :firstName="firstName" :lastName="lastName" :name3="name3" :status="status" class="email"/>
</template>

<style scoped>
.buttons {
  display: flex;
  gap: 20px;
}

.email {
  margin-top: 20px;
}
</style>