<template lang="">
  <div>
    <router-view></router-view>
    <ChatWoot />
  </div>
</template>
<script>
import ChatWoot from "@/components/ChatWoot.vue";
export default {
  components: {
    ChatWoot,
  }
}
</script>
