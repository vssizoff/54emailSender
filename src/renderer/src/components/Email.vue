<script setup lang="ts">
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
  }
});

function send() {
  window.electron.ipcRenderer.invoke("send", props.email);
}
</script>

<template>
  <span>
    {{props.email}}: {{props.firstName}} {{props.lastName}} {{props.name3}}. Status {{props.status}} <button @click="send">Send</button>
  </span>
</template>

<style scoped>

</style>