<script setup lang="ts">
import {Dialog, InputText, InputNumber, ToggleSwitch, FloatLabel} from "primevue";
import { type PropType, ref, watch } from "vue";
import type { EmailConfigType } from "@renderer/types.js";

const props = defineProps({
  email: {
    type: Object as PropType<EmailConfigType | null>,
    default: null
  }
});

const emit = defineEmits({
  "update:email": (_: EmailConfigType) => true
});

const user = ref<string>(props.email?.mailUser ?? ""),
  host = ref<string>(props.email?.mailHost ?? ""),
  pass = ref<string>(props.email?.mailPass ?? ""),
  port = ref<number>(props.email?.mailPort ?? 465),
  secure = ref<boolean>(props.email?.mailSecure ?? true),
  sendsPerHour = ref<number>(props.email?.sendsPerHour ?? 15);

watch(user, value => emit("update:email", {
  mailUser: value,
  mailHost: host.value,
  mailPass: host.value,
  mailPort: port.value,
  mailSecure: secure.value,
  sendsPerHour: sendsPerHour.value
}));
watch(host, value => emit("update:email", {
  mailUser: user.value,
  mailHost: value,
  mailPass: host.value,
  mailPort: port.value,
  mailSecure: secure.value,
  sendsPerHour: sendsPerHour.value
}));
watch(pass, value => emit("update:email", {
  mailUser: user.value,
  mailHost: host.value,
  mailPass: value,
  mailPort: port.value,
  mailSecure: secure.value,
  sendsPerHour: sendsPerHour.value
}));
watch(port, value => emit("update:email", {
  mailUser: user.value,
  mailHost: host.value,
  mailPass: host.value,
  mailPort: value,
  mailSecure: secure.value,
  sendsPerHour: sendsPerHour.value
}));
watch(secure, value => emit("update:email", {
  mailUser: user.value,
  mailHost: host.value,
  mailPass: host.value,
  mailPort: port.value,
  mailSecure: value,
  sendsPerHour: sendsPerHour.value
}));
watch(sendsPerHour, value => emit("update:email", {
  mailUser: user.value,
  mailHost: host.value,
  mailPass: pass.value,
  mailPort: port.value,
  mailSecure: secure.value,
  sendsPerHour: value
}));
</script>

<template>
  <Dialog>
    <div class="dialog">
      <FloatLabel variant="on">
        <InputText id="user" v-model="user" autocomplete="off"/>
        <label for="user">User</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <InputText id="host" v-model="host" autocomplete="off"/>
        <label for="host">SMTP host</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <InputText id="pass" v-model="pass" autocomplete="off"/>
        <label for="pass">Pass</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <InputNumber id="port" v-model="port" autocomplete="off"/>
        <label for="port">Port</label>
      </FloatLabel>
      <span class="secure">Secure: <ToggleSwitch v-model="secure"/></span>
      <FloatLabel variant="on">
        <InputNumber id="sendsPerHour" v-model="sendsPerHour" autocomplete="off"/>
        <label for="sendsPerHour">За час автоматически (кнопка "отправить неотправленное") отправлять писем</label>
      </FloatLabel>
      <slot/>
    </div>
  </Dialog>
</template>

<style scoped>
.dialog {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.secure {
  display: flex;
  div {
    margin-left: 10px;
  }
}
</style>