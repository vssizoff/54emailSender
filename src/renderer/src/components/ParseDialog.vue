<script setup lang="ts">
import {Button, Dialog, FloatLabel, InputText, InputNumber, ToggleSwitch} from "primevue";
import {ref} from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits({
  "update:visible": (_: boolean) => true
});

const nameColumn = ref("A");
const surnameColumn = ref("B");
const name3Column = ref("C");
const emailColumn = ref("D");
const canName3Empty = ref(true);
const skip = ref(1);

function selectFile() {
  emit("update:visible", false);
  window.electron.ipcRenderer.send("selectFile", {
    nameColumn: nameColumn.value,
    surnameColumn: surnameColumn.value,
    name3Column: name3Column.value,
    emailColumn: emailColumn.value,
    canName3Empty: canName3Empty.value,
    skip: skip.value
  });
}
</script>

<template>
  <Dialog header="Вымерите колонки в таблице" :visible="props.visible" @update:visible="$emit('update:visible', $event)">
    <div class="dialog">
      <FloatLabel variant="on">
        <InputText id="nameColumn" v-model="nameColumn" autocomplete="off"/>
        <label for="nameColumn">Имя: </label>
      </FloatLabel>
      <FloatLabel variant="on">
        <InputText id="surnameColumn" v-model="surnameColumn" autocomplete="off"/>
        <label for="surnameColumn">Фамилия: </label>
      </FloatLabel>
      <FloatLabel variant="on">
        <InputText id="name3Column" v-model="name3Column" autocomplete="off"/>
        <label for="name3Column">Отчество: </label>
      </FloatLabel>
      <span class="toggle">Может быть пустым: <ToggleSwitch v-model="canName3Empty"/></span>
      <FloatLabel variant="on">
        <InputText id="emailColumn" v-model="emailColumn" autocomplete="off"/>
        <label for="emailColumn">Email: </label>
      </FloatLabel>
      <FloatLabel variant="on">
        <InputNumber id="skip" v-model="skip" autocomplete="off"/>
        <label for="skip">Пропустить заголовки: </label>
      </FloatLabel>
      <Button @click="selectFile">Выбрать</Button>
    </div>
  </Dialog>
</template>

<style scoped>
.dialog {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  input, .p-inputnumber {
    width: 100%;
  }
}

.toggle {
  display: flex;
  div {
    margin-left: 10px;
  }
}
</style>