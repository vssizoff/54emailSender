<script setup lang="ts">
import {useRoute} from "vue-router";
import {onMounted, onUnmounted, ref, watch} from "vue";
import {FloatLabel, InputText, Button} from "primevue";

const route = useRoute();
const index = ref(0);

const name = ref("");
const sender = ref("Школa №54 <%mailUser%>");
const subject = ref("");
const data = ref("");
const staticVars = ref<Record<string, string>>({});
const tableVars = ref<Record<string, string>>({});

onMounted(async () => {
  index.value = Number(route.params.index);
  console.log(index.value);

  if (index.value !== -1) {
    let template = await window.electron.ipcRenderer.invoke("getFullTemplate", index.value);
    name.value = template.name;
    sender.value = template.sender;
    subject.value = template.subject;
    data.value = template.data;
    staticVars.value = template.staticVars;
    tableVars.value = template.tableVars;
  }
});

import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Mention from '@tiptap/extension-mention'

const props = defineProps({
  modelValue: String
})
const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue || '<p>Напишите email...</p>',
  extensions: [
    StarterKit.configure({}),
    Mention.configure({
      suggestion: {
        items: ({ query }) => {
          // переменные для email шаблонов
          const variables = [
            { id: 'userName', label: '{{userName}}' },
            { id: 'company', label: '{{company}}' },
            { id: 'date', label: '{{date}}' }
          ]
          return variables.filter(item =>
              item.label.toLowerCase().includes(query.toLowerCase())
          )
        }
      }
    })
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

watch(() => props.modelValue, (newVal) => {
  if (editor.value && newVal !== editor.value.getHTML()) {
    editor.value.commands.setContent(newVal, false)
  }
})

onMounted(() => {
  if (editor.value) editor.value.commands.focus()
})

onUnmounted(() => {
  editor.value?.destroy()
})
</script>

<template>
  <main>
    <div class="vars">
      <FloatLabel variant="on">
        <InputText id="name" v-model="name" autocomplete="off"/>
        <label for="name">Название</label>
      </FloatLabel>
      <h3>Переменные:</h3>
      <p>
        %firstName% - Имя<br>
        %lastName% - Фамилия<br>
        %name3% - Отчество<br>
        %email% - Email получателя<br>
        %mailUser% - Email отправителя<br>
      </p>
      <h4 class="staticVarsLabel">Свои переменные (например, дата):</h4>
      <table class="staticVars">
        <tbody>
          <tr>
            <th>Имя</th>
            <th>Значение</th>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="edit">
      <FloatLabel variant="on">
        <InputText id="sender" v-model="sender"/>
        <label for="sender">Отправитель</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <InputText id="subject" v-model="subject"/>
        <label for="subject">Тема</label>
      </FloatLabel>
      <!--  <Button @click="readFile">Выбрать файл (заменить содержимое)</Button>-->
      <div class="email-editor">
        <div class="toolbar">
          <Button @click="editor?.chain().focus().toggleBold().run()" :class="{ active: editor?.isActive('bold') }">
            Bold
          </Button>
          <Button @click="editor?.chain().focus().toggleItalic().run()" :class="{ active: editor?.isActive('italic') }">
            Italic
          </Button>
          <Button @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()">
            H2
          </Button>
        </div>
        <EditorContent :editor="editor" class="editor-content"/>
      </div>
    </div>
  </main>
</template>

<style>
body {
  display: block !important;
}

#app {
  height: 100svh;
}
</style>

<style scoped>
input {
  width: 100%;
}

main {
  width: 100%;
  height: 100%;
  display: flex;
  padding: 20px;
  gap: 20px;

  .vars {
    flex-basis: 20%;
  }

  .edit {
    flex-basis: 80%;
  }

  .edit {
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: 100%;

    .textarea {
      height: 100%;
    }
  }
}

.email-editor, .editor-content {
  height: 100%;
}

.toolbar {
  padding: 8px;
  border-bottom: 1px solid #eee;
}
.toolbar button {
  margin-right: 8px;
  padding: 4px 8px;
}
.active {
  background: #007bff;
  color: white;
}
</style>