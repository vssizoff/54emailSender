<script setup lang="ts">
import { LogType } from "@renderer/types";
import { Panel, Button, Dialog } from "primevue";
import { PropType, ref } from "vue";

defineProps({
  log: {
    type: Object as PropType<LogType>,
    required: true
  }
});

const visible = ref(false);
</script>

<template>
  <div>
    <Panel :header="log.email">
      Тема: {{ log.subject }}
      <br>
      Отправлено: {{ (new Date(log.datetime)).toLocaleString("ru") }}
      <br>
      <Button @click="visible = true">Содержание</Button>
    </Panel>
    <Dialog v-model:visible="visible">
      <template #header>
        <p class="dialogHeader">
          Получатель: {{ log.email }}
          <br>
          Тема: {{ log.subject }}
        </p>
      </template>
      {{ log.message }}
    </Dialog>
  </div>
</template>

<style scoped>
.dialogHeader {
  font-size: 20px;
  font-weight: bold;
  margin-right: 20px;
}
</style>
