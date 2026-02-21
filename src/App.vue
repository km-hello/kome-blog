<script setup lang="ts">
import {Toaster} from "vue-sonner";
import SidebarDrawer from '@/components/common/SidebarDrawer.vue'
</script>

<template>
  <router-view />
  <SidebarDrawer />
  <Toaster position="top-right" :duration="3000" richColors />
</template>

