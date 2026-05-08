<script setup lang="ts">
import {useRoute} from "vue-router";
import {onMounted, onUnmounted, ref} from "vue";
import {FloatLabel, InputText, Button, ColorPicker} from "primevue";

import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Mention from '@tiptap/extension-mention'
import Image from '@tiptap/extension-image'
import {TextStyle} from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'

const route = useRoute();
const index = ref(0);

const name = ref("");
const sender = ref("Школa №54 <%mailUser%>");
const subject = ref("");
const content = ref("");
const staticVars = ref<Record<string, string>>({});
const tableVars = ref<Record<string, string>>({});

const editor = useEditor({
  content: '<p>Напишите email...</p>',
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
    }),
    Image.configure({
      allowBase64: true,
      inline: true,
      HTMLAttributes: {
        class: 'email-img'
      }
    }),
    TextStyle,
    Color.configure({
      types: ['textStyle']
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph', 'blockquote']
    })
  ],
  onUpdate: ({ editor }) => {
    content.value = editor.getHTML();
  }
});

onMounted(async () => {
  index.value = Number(route.params.index);

  if (index.value !== -1) {
    let template = await window.electron.ipcRenderer.invoke("getFullTemplate", index.value);
    name.value = template.name;
    sender.value = template.sender;
    subject.value = template.subject;
    content.value = template.data;
    staticVars.value = template.staticVars;
    tableVars.value = template.tableVars;

    editor.value?.commands.setContent(content.value);
  }
});

onUnmounted(() => {
  editor.value?.destroy();
});

const setHeading = (level) => {
  editor.value?.chain().focus().toggleHeading({ level }).run()
}

const setLink = () => {
  const url = prompt('URL ссылки:')
  if (url) {
    editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }
}

const insertImage = () => {
  const url = prompt('URL изображения:')
  if (url) {
    editor.value?.chain().focus().setImage({ src: url, alt: 'Изображение' }).run()
  }
}

const setTextColor = (color) => {
  if (color) {
    editor.value?.chain().focus().setColor(color).run()
  }
}

const setTextAlign = (align: string) => {
  if (!editor.value) return

  editor.value.chain()
      .focus()
      .setTextAlign(align)
      .run()
}

function editEmailConfig() {
  if (index.value === -1) window.electron.ipcRenderer.invoke("addTemplate", name.value, sender.value,
      subject.value, content.value);
  else window.electron.ipcRenderer.invoke("editTemplate", index.value, name.value, sender.value,
      subject.value, content.value);
  window.electron.ipcRenderer.invoke("close");
}

function close() {
  window.electron.ipcRenderer.invoke("close");
}
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
      <div class="buttons">
        <Button @click="editEmailConfig">Сохранить</Button>
        <Button @click="close" severity="danger">Закрыть</Button>
      </div>
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
          <!-- Текст -->
          <Button @click="editor?.chain().focus().toggleBold().run()" :class="{ active: editor?.isActive('bold') }">
            <strong>B</strong>
          </Button>
          <Button @click="editor?.chain().focus().toggleItalic().run()" :class="{ active: editor?.isActive('italic') }">
            <em>I</em>
          </Button>
          <Button @click="editor?.chain().focus().toggleStrike().run()" :class="{ active: editor?.isActive('strike') }">
            <s>S</s>
          </Button>

          <!-- Заголовки -->
          <Button @click="setHeading(1)" :class="{ active: editor?.isActive('heading', { level: 1 }) }">H1</Button>
          <Button @click="setHeading(2)" :class="{ active: editor?.isActive('heading', { level: 2 }) }">H2</Button>
          <Button @click="setHeading(3)" :class="{ active: editor?.isActive('heading', { level: 3 }) }">H3</Button>

          <!-- Списки -->
          <Button @click="editor?.chain().focus().toggleBulletList().run()" :class="{ active: editor?.isActive('bulletList') }">
            •
          </Button>
          <Button @click="editor?.chain().focus().toggleOrderedList().run()" :class="{ active: editor?.isActive('orderedList') }">
            1.
          </Button>

          <!-- Блок -->
          <Button @click="editor?.chain().focus().toggleBlockquote().run()" :class="{ active: editor?.isActive('blockquote') }">
            »
          </Button>

          <!-- Ссылки и изображения -->
          <Button @click="setLink" :disabled="!editor?.isActive('link')">
            🔗
          </Button>
          <Button @click="insertImage">
            🖼️
          </Button>

          <!-- Цвета -->
          <ColorPicker @update:modelValue="setTextColor"/>

          <!-- Выравнивание -->
          <Button
              @click="setTextAlign('left')"
              :class="{ active: editor?.isActive({ textAlign: 'left' }) }"
              title="Выровнять слева">
            <span>Л</span>
          </Button>
          <Button
              @click="setTextAlign('center')"
              :class="{ active: editor?.isActive({ textAlign: 'center' }) }"
              title="По центру">
            <span>Ц</span>
          </Button>
          <Button
              @click="setTextAlign('right')"
              :class="{ active: editor?.isActive({ textAlign: 'right' }) }"
              title="По правому краю">
            <span>П</span>
          </Button>

          <!-- Undo/Redo -->
          <Button @click="editor?.chain().focus().undo().run()" :disabled="!editor?.can().undo()">
            ↶
          </Button>
          <Button @click="editor?.chain().focus().redo().run()" :disabled="!editor?.can().redo()">
            ↷
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

.email-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-content {
  flex: 1;
}

.editor-content :deep(.tiptap) {
  height: 100%;
  outline: none !important;

  :deep(strong) {
    font-weight: bold;
  }
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

.buttons {
  position: absolute;
  bottom: 20px;

  display: flex;
  gap: 10px;
}
</style>