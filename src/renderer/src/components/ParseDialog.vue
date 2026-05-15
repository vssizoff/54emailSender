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

const nameColumn = ref("B");
const surnameColumn = ref("A");
const name3Column = ref("C");
const emailColumn = ref("D");
const canName3Empty = ref(true);
const skip = ref(1);
const condition = ref("true");

function selectFile() {
  emit("update:visible", false);
  window.electron.ipcRenderer.send("selectFile", {
    nameColumn: nameColumn.value,
    surnameColumn: surnameColumn.value,
    name3Column: name3Column.value,
    emailColumn: emailColumn.value,
    canName3Empty: canName3Empty.value,
    skip: skip.value,
    condition: condition.value
  });
}
</script>

<template>
  <Dialog header="Выберите колонки в таблице" :visible="props.visible" @update:visible="$emit('update:visible', $event)">
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
      <FloatLabel variant="on">
        <InputText id="condition" v-model="condition" autocomplete="off"/>
        <label for="condition">Условие: </label>
      </FloatLabel>
      <p>
        Например, E >= 30 или F === 1
        <br>
        && - логическое и
        <br>
        || - логическое или
        <br>
        ! - логическое не
        <br>
        Есть поддержка других js операторов/функций
      </p>
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
