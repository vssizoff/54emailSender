<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { EmailConfigType, Entry } from "@renderer/types.js";
import Email from "@renderer/components/Email.vue";
import EmailConfig from "@renderer/components/EmailConfig.vue";
import {Button, Drawer} from "primevue";
import EmailConfigDialog from "@renderer/components/EmailConfigDialog.vue";

const emails = ref<Array<Entry>>([]);
const emailConfig = ref<{emails: Array<EmailConfigType>, selected: number} | null>(null);
const emailSelectorVisible = ref<boolean>(false);
const newEmailEditorVisible = ref<boolean>(false);
const newEmailConfig = ref<EmailConfigType | null>(null);

onMounted(async () => {
  window.electron.ipcRenderer.on("set", (_, newEmails: Array<Entry>) => emails.value = newEmails);
  window.electron.ipcRenderer.on("status", (_, [searchEmail, status]) => {
    emails.value = emails.value.map(entry => {
      if (entry.email === searchEmail) return {...entry, status};
      return entry;
    });
  });
  window.electron.ipcRenderer.on("rm", (_, searchEmail) => {
    emails.value = emails.value.filter(({email}) => email !== searchEmail);
  });
  window.electron.ipcRenderer.on("emailConfig", (_, config) => {
    emailConfig.value = config;
  });
  window.electron.ipcRenderer.on("emailsConfig.select", (_, index) => {
    if (!emailConfig.value) return;
    emailConfig.value.selected = index;
  });
  emailConfig.value = await window.electron.ipcRenderer.invoke("getEmails");
});

function selectFile() {
  window.electron.ipcRenderer.send("selectFile");
}

function send() {
  window.electron.ipcRenderer.invoke("sendAll");
}

function rm() {
  window.electron.ipcRenderer.invoke("rmAll");
}

function addEmailConfig() {
  window.electron.ipcRenderer.invoke("addEmail", JSON.parse(JSON.stringify(newEmailConfig.value)));
  newEmailEditorVisible.value = false;
}
</script>

<template>
  <main>
    <h1>Email рассылки</h1>
    <div class="buttons">
      <Button @click="emailSelectorVisible = true">Выбрать отправителя</Button>
      <Button @click="selectFile">Выбрать таблицу</Button>
      <Button @click="send">Отправить неотправленные</Button>
      <Button @click="rm" severity="danger">Очистить</Button>
    </div>
    <Email v-for="{email, firstName, lastName, name3, status} in emails" :email="email" :firstName="firstName" :lastName="lastName" :name3="name3" :status="status" class="email"/>
  </main>
  <Drawer position="right" v-model:visible="emailSelectorVisible" :class="$style.emailSelector">
    <header class="emailHeader">
      <h2>Email configs</h2>
      <Button @click="newEmailEditorVisible = true">Добавить</Button>
    </header>
    <div v-for="(email, index) in emailConfig?.emails ?? []" class="emailConfig">
      <EmailConfig :email="email" :index="index" :selected="emailConfig?.selected === index"/>
    </div>
  </Drawer>
  <EmailConfigDialog v-model:email="newEmailConfig" v-model:visible="newEmailEditorVisible">
    <Button severity="success" @click="addEmailConfig">Добавить</Button>
  </EmailConfigDialog>
</template>

<style scoped>
main {
  text-align: center;
}

.buttons {
  display: flex;
  gap: 20px;
}

.email {
  margin-top: 20px;
}

.emailHeader {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.emailConfig {
  margin-top: 20px;
}
</style>

<style module>
.emailSelector {
  width: 600px !important;
  max-width: 80dvw !important;
}
</style>