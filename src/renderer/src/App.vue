<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { EmailConfigType, Entry } from "@renderer/types.js";
import Email from "@renderer/components/Email.vue";
import EmailConfig from "@renderer/components/EmailConfig.vue";
import {Button, Drawer} from "primevue";
import EmailConfigDialog from "@renderer/components/EmailConfigDialog.vue";
import TemplateConfig from "@renderer/components/TemplateConfig.vue";
import TemplateConfigDialog from "@renderer/components/TemplateConfigDialog.vue";

const emails = ref<Array<Entry>>([]);
const emailConfig = ref<{emails: Array<EmailConfigType>, selected: number} | null>(null);
const emailSelectorVisible = ref<boolean>(false);
const newEmailEditorVisible = ref<boolean>(false);
const newEmailConfig = ref<EmailConfigType | null>(null);
const templates = ref<{templates: Array<{name: string, data: string}>, selected: number} | null>(null);
const templateSelectorVisible = ref<boolean>(false);
const newTemplateEditorVisible = ref<boolean>(false);
const newTemplateName = ref<string>("");
const newTemplateData = ref<string>("");

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
  window.electron.ipcRenderer.on("templates", (_, newTemplates) => {
    templates.value = newTemplates;
  });
  window.electron.ipcRenderer.on("templates.select", (_, index) => {
    if (!templates.value) return;
    templates.value.selected = index;
  });
  emailConfig.value = await window.electron.ipcRenderer.invoke("getEmails");
  templates.value = await window.electron.ipcRenderer.invoke("getTemplates");
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

function addTemplate() {
  window.electron.ipcRenderer.invoke("addTemplate", newTemplateName.value, newTemplateData.value);
  newTemplateEditorVisible.value = false;
  newTemplateName.value = "";
  newTemplateData.value = "";
}
</script>

<template>
  <main>
    <h1>Email рассылки</h1>
    <div class="buttons">
      <Button @click="emailSelectorVisible = true">Выбрать отправителя</Button>
      <Button @click="selectFile">Выбрать таблицу</Button>
      <Button @click="templateSelectorVisible = true">Выбрать шаблон</Button>
      <Button @click="send">Отправить неотправленные</Button>
      <Button @click="rm" severity="danger">Очистить</Button>
    </div>
    <Email v-for="{email, firstName, lastName, name3, status} in emails" :email="email" :firstName="firstName" :lastName="lastName" :name3="name3" :status="status" class="email"/>
  </main>
  <Drawer position="right" v-model:visible="emailSelectorVisible" :class="$style.drawer">
    <header class="drawerHeader">
      <h2>Email configs</h2>
      <Button @click="newEmailEditorVisible = true">Добавить</Button>
    </header>
    <div v-for="(email, index) in emailConfig?.emails ?? []" class="drawerEntry">
      <EmailConfig :email="email" :index="index" :selected="emailConfig?.selected === index"/>
    </div>
  </Drawer>
  <Drawer position="right" v-model:visible="templateSelectorVisible" :class="$style.drawer">
    <header class="drawerHeader">
      <h2>Шаблоны</h2>
      <Button @click="newTemplateEditorVisible = true">Добавить</Button>
    </header>
    <div v-for="({name}, index) in templates?.templates ?? []" class="drawerEntry">
      <TemplateConfig :name="name" :index="index" :selected="templates?.selected === index"/>
    </div>
  </Drawer>
  <EmailConfigDialog v-model:email="newEmailConfig" v-model:visible="newEmailEditorVisible">
    <Button severity="success" @click="addEmailConfig">Добавить</Button>
  </EmailConfigDialog>
  <TemplateConfigDialog v-model:name="newTemplateName" v-model:data="newTemplateData" v-model:visible="newTemplateEditorVisible">
    <Button severity="success" @click="addTemplate">Добавить</Button>
  </TemplateConfigDialog>
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

.drawerHeader {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.drawerEntry {
  margin-top: 20px;
}
</style>

<style module>
.drawer {
  width: 600px !important;
  max-width: 80dvw !important;
}
</style>