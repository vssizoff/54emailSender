<script setup lang="ts">
import {useRoute} from "vue-router";
import {onMounted, onUnmounted, ref} from "vue";
import {FloatLabel, InputText, Button, ColorPicker, Dialog, InputNumber} from "primevue";

import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import {TextStyle} from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyleKit } from '@tiptap/extension-text-style'

import boldIcon from "@renderer/assets/bold.svg";
import italicIcon from "@renderer/assets/italic.svg";
import underlineIcon from "@renderer/assets/underline.svg";
import strikethroughIcon from "@renderer/assets/strikethrough.svg";
import heading1Icon from "@renderer/assets/heading1.svg";
import heading2Icon from "@renderer/assets/heading2.svg";
import heading3Icon from "@renderer/assets/heading3.svg";
import bulletListIcon from "@renderer/assets/bulletList.svg";
import orderedListIcon from "@renderer/assets/orderedList.svg";
import quoteIcon from "@renderer/assets/quote.svg";
import linkIcon from "@renderer/assets/link.svg";
// import imageIcon from "@renderer/assets/image.svg";
import colorIcon from "@renderer/assets/color.svg";
import textAlignLeftIcon from "@renderer/assets/textAlignLeft.svg";
import textAlignCenterIcon from "@renderer/assets/textAlignCenter.svg";
import textAlignRightIcon from "@renderer/assets/textAlignRight.svg";
import undoIcon from "@renderer/assets/undo.svg";
import redoIcon from "@renderer/assets/redo.svg";
import fontIcon from "@renderer/assets/font.svg";

const route = useRoute();
const index = ref(0);

const name = ref("");
const sender = ref("Школa №54 <%mailUser%>");
const subject = ref("");
const content = ref("");
const staticVars = ref<Record<string, string>>({});
const tableVars = ref<Record<string, string>>({});

const urlDialogVisible = ref(false);
const url = ref("");

const editor = useEditor({
  content: '<p>Напишите email...</p>',
  extensions: [
    StarterKit.configure({}),
    Image.configure({
      allowBase64: true,
      inline: true,
      HTMLAttributes: {
        class: 'email-img'
      }
    }),
    TextStyle,
    TextStyleKit,
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

const setLink = (url) => {
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

const color = ref("000")
const fontSize = ref(16)

const setTextColor = (color) => {
  if (color) {
    editor.value?.chain().focus().setColor("#" + color).run()
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
            <img :src="boldIcon" alt="bold"/>
          </Button>
          <Button @click="editor?.chain().focus().toggleItalic().run()" :class="{ active: editor?.isActive('italic') }">
            <img :src="italicIcon" alt="italic"/>
          </Button>
          <Button @click="editor?.chain().focus().toggleStrike().run()" :class="{ active: editor?.isActive('strike') }">
            <img :src="strikethroughIcon" alt="strikethrough"/>
          </Button>
          <Button @click="editor?.chain().focus().toggleUnderline().run()" :class="{ active: editor?.isActive('underline') }">
            <img :src="underlineIcon" alt="underline"/>
          </Button>
          <Button @click="editor?.chain().focus().setFontSize(fontSize + 'px').run()">
            <img :src="fontIcon" alt="font size">
            <InputNumber v-model="fontSize" @click.stop size="small" class="fontSize"/>
          </Button>

          <!-- Заголовки -->
          <Button @click="setHeading(1)" :class="{ active: editor?.isActive('heading', { level: 1 }) }">
            <img :src="heading1Icon" alt="heading1"/>
          </Button>
          <Button @click="setHeading(2)" :class="{ active: editor?.isActive('heading', { level: 2 }) }">
            <img :src="heading2Icon" alt="heading2"/>
          </Button>
          <Button @click="setHeading(3)" :class="{ active: editor?.isActive('heading', { level: 3 }) }">
            <img :src="heading3Icon" alt="heading3"/>
          </Button>

          <!-- Списки -->
          <Button @click="editor?.chain().focus().toggleBulletList().run()" :class="{ active: editor?.isActive('bulletList') }">
            <img :src="bulletListIcon" alt="bulletList"/>
          </Button>
          <Button @click="editor?.chain().focus().toggleOrderedList().run()" :class="{ active: editor?.isActive('orderedList') }">
            <img :src="orderedListIcon" alt="orderedList"/>
          </Button>

          <!-- Блок -->
          <Button @click="editor?.chain().focus().toggleBlockquote().run()" :class="{ active: editor?.isActive('blockquote') }">
            <img :src="quoteIcon" alt="quote"/>
          </Button>

          <!-- Ссылки и изображения -->
          <Button @click="urlDialogVisible = true">
            <img :src="linkIcon" alt="link"/>
          </Button>
<!--          <Button @click="insertImage">
            <img :src="imageIcon" alt="image"/>
          </Button>-->

          <!-- Цвета -->
          <Button @click="setTextColor(color)">
            <img :src="colorIcon" alt="color"/>
            <ColorPicker v-model="color"/>
          </Button>

          <!-- Выравнивание -->
          <Button
              @click="setTextAlign('left')"
              :class="{ active: editor?.isActive({ textAlign: 'left' }) }"
              title="Выровнять слева">
            <img :src="textAlignLeftIcon" alt="left"/>
          </Button>
          <Button
              @click="setTextAlign('center')"
              :class="{ active: editor?.isActive({ textAlign: 'center' }) }"
              title="По центру">
            <img :src="textAlignCenterIcon" alt="center"/>
          </Button>
          <Button
              @click="setTextAlign('right')"
              :class="{ active: editor?.isActive({ textAlign: 'right' }) }"
              title="По правому краю">
            <img :src="textAlignRightIcon" alt="right"/>
          </Button>

          <!-- Undo/Redo -->
          <Button @click="editor?.chain().focus().undo().run()" :disabled="!editor?.can().undo()">
            <img :src="undoIcon" alt="undo"/>
          </Button>
          <Button @click="editor?.chain().focus().redo().run()" :disabled="!editor?.can().redo()">
            <img :src="redoIcon" alt="redo"/>
          </Button>
        </div>
        <EditorContent :editor="editor" class="editor-content"/>
      </div>
    </div>
    <Dialog v-model:visible="urlDialogVisible" header="Введите ссылку">
      <div class="urlDialog">
        <InputText v-model="url"/>
        <Button @click="urlDialogVisible = false; setLink(url)">OK</Button>
      </div>
    </Dialog>
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
  }
}

.email-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-content {
  flex: 1;
  background: white;
  border-radius: 20px;
  padding: 10px;
}

.editor-content :deep(.tiptap) {
  height: 100%;
  outline: none !important;

  :deep(strong) {
    font-weight: bold;
  }

  :deep(blockquote) {
    border-left: 3px solid gray;
    margin: 1.5rem 0;
    padding-left: 1rem;
  }

  :deep(*) {
    color: black;
  }
}

.toolbar {
  padding: 8px;
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

.urlDialog {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fontSize :deep(.p-inputtext) {
  width: 50px;
  font-size: 12px;
  padding: 4px;
}
</style>