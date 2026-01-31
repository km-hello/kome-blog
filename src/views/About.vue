<!-- src/views/About.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MapPin, Briefcase, Calendar, Heart, Code, Coffee, Music, BookOpen, Github, Twitter, Mail, Send } from 'lucide-vue-next'
import AppHeader from '@/components/layout/AppHeader.vue'
import SiteFooter from '@/components/layout/SiteFooter.vue'
import { getSiteInfoApi, type SiteInfoResponse } from '@/api/site'

const siteInfo = ref<SiteInfoResponse | null>(null)

const skills = ref([
  { name: 'Vue.js', level: 'Expert' },
  { name: 'TypeScript', level: 'Expert' },
  { name: 'React', level: 'Proficient' },
  { name: 'Node.js', level: 'Proficient' },
  { name: 'Tailwind CSS', level: 'Expert' },
  { name: 'Go', level: 'Learning' },
  { name: 'Rust', level: 'Learning' },
  { name: 'Docker', level: 'Proficient' },
  { name: 'PostgreSQL', level: 'Proficient' },
  { name: 'Redis', level: 'Proficient' },
])

const timeline = ref([
  {
    year: '2024',
    title: 'Full Stack Developer',
    description: 'Building modern web applications with Vue.js and Go.',
    icon: Code,
  },
  {
    year: '2022',
    title: 'Started Blogging',
    description: 'Began sharing thoughts about code, design, and life.',
    icon: BookOpen,
  },
  {
    year: '2020',
    title: 'First Line of Code',
    description: 'Wrote my first "Hello World" and fell in love with programming.',
    icon: Heart,
  },
])

const hobbies = ref([
  { icon: Code, label: 'Coding' },
  { icon: Coffee, label: 'Coffee' },
  { icon: Music, label: 'Music' },
  { icon: BookOpen, label: 'Reading' },
])

onMounted(async () => {
  siteInfo.value = await getSiteInfoApi()
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <div class="max-w-6xl mx-auto px-4 md:px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Main Content -->
      <main class="lg:col-span-8 flex flex-col gap-6">

        <!-- Hero Card -->
        <div class="bento-card p-8 md:p-10">
          <div class="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div class="shrink-0">
              <div class="size-32 md:size-40 rounded-2xl p-1.5 bg-white border border-gray-100 shadow-lg overflow-hidden">
                <img
                    :src="siteInfo?.owner.avatar || 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix'"
                    :alt="siteInfo?.owner.nickname"
                    class="size-full rounded-xl bg-slate-50 object-cover"
                >
              </div>
            </div>

            <div class="flex-1 text-center md:text-left">
              <h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                {{ siteInfo?.owner.nickname || 'Admin' }}
              </h1>
              <p class="text-lg text-slate-500 mb-6 leading-relaxed">
                {{ siteInfo?.owner.description || 'Creator & Developer' }}
              </p>

              <div class="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-500">
                <span class="flex items-center gap-1.5">
                  <MapPin :size="14" class="text-slate-400" />
                  <span>China</span>
                </span>
                <span class="flex items-center gap-1.5">
                  <Briefcase :size="14" class="text-slate-400" />
                  <span>Full Stack Developer</span>
                </span>
                <span class="flex items-center gap-1.5">
                  <Calendar :size="14" class="text-slate-400" />
                  <span>February 2020</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- About Me -->
        <div class="bento-card p-8">
          <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">About Me</h2>

          <div class="prose prose-slate max-w-none">
            <p class="text-[15px] leading-7 text-slate-600 mb-4">
              Hi there! 👋 I'm a passionate developer who loves building beautiful and functional web applications.
              I believe in writing clean, maintainable code and creating user experiences that delight.
            </p>
            <p class="text-[15px] leading-7 text-slate-600 mb-4">
              My journey into programming started in 2020, and since then, I've been constantly learning and exploring
              new technologies. I'm particularly interested in the Vue.js ecosystem, TypeScript, and modern CSS frameworks like Tailwind.
            </p>
            <p class="text-[15px] leading-7 text-slate-600">
              When I'm not coding, you can find me brewing coffee, listening to music, or reading books about design and technology.
              I believe that great software comes from understanding both the technical and human aspects of what we build.
            </p>
          </div>
        </div>

        <!-- Skills -->
        <div class="bento-card p-8">
          <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Skills & Technologies</h2>

          <div class="flex flex-wrap gap-2">
            <span
                v-for="skill in skills"
                :key="skill.name"
                class="px-4 py-2 rounded-lg text-sm font-medium cursor-default hover:-translate-y-0.5 transition-transform"
                :class="{
                'bg-slate-900 text-white': skill.level === 'Expert',
                'bg-slate-100 text-slate-700 border border-slate-200': skill.level === 'Proficient',
                'bg-slate-50 text-slate-500 border border-slate-100': skill.level === 'Learning',
              }"
            >
              {{ skill.name }}
              <span v-if="skill.level === 'Learning'" class="ml-1.5 text-[10px] uppercase tracking-wider opacity-60">
                📚
              </span>
            </span>
          </div>

          <div class="flex flex-wrap gap-4 mt-6 pt-4 border-t border-slate-50">
            <span class="flex items-center gap-2 text-xs text-slate-400">
              <span class="size-3 rounded bg-slate-900"></span>
              Expert
            </span>
            <span class="flex items-center gap-2 text-xs text-slate-400">
              <span class="size-3 rounded bg-slate-100 border border-slate-200"></span>
              Proficient
            </span>
            <span class="flex items-center gap-2 text-xs text-slate-400">
              <span class="size-3 rounded bg-slate-50 border border-slate-100"></span>
              Learning
            </span>
          </div>
        </div>

        <!-- Timeline -->
        <div class="bento-card p-8">
          <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Journey</h2>
          <div class="relative">
            <div class="absolute left-[1.0625rem] top-2 bottom-2 w-px bg-slate-100"></div>

            <div class="space-y-6">
              <div
                  v-for="(item, index) in timeline"
                  :key="index"
                  class="relative pl-12 group"
              >
                <div class="absolute left-0 top-0.5 size-[2.125rem] rounded-full bg-white border-2 border-slate-100 flex items-center justify-center group-hover:border-slate-300 transition-colors">
                  <component :is="item.icon" :size="14" class="text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>

                <div class="pb-6">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded font-mono">
                      {{ item.year }}
                    </span>
                    <h3 class="text-sm font-bold text-slate-900">{{ item.title }}</h3>
                  </div>
                  <p class="text-sm text-slate-500 leading-relaxed">
                    {{ item.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Hobbies -->
        <div class="bento-card p-8">
          <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">When I'm Not Coding</h2>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
                v-for="hobby in hobbies"
                :key="hobby.label"
                class="flex flex-col items-center justify-center py-6 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all cursor-default group"
            >
              <component
                  :is="hobby.icon"
                  :size="24"
                  class="text-slate-400 mb-3 group-hover:text-slate-600 transition-colors"
              />
              <span class="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                {{ hobby.label }}
              </span>
            </div>
          </div>
        </div>

      </main>

      <!-- Sidebar -->
      <aside class="lg:col-span-4 relative">
        <div class="sticky top-24 space-y-5">

          <!-- Stats Card -->
          <div class="bento-card p-6">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Site Stats</h4>

            <div class="grid grid-cols-2 gap-3">
              <div class="bg-slate-50 rounded-lg p-4 text-center border border-slate-100">
                <div class="text-2xl font-bold text-slate-800">
                  {{ siteInfo?.stats.publishedPostCount || 0 }}
                </div>
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Posts</div>
              </div>
              <div class="bg-slate-50 rounded-lg p-4 text-center border border-slate-100">
                <div class="text-2xl font-bold text-slate-800">
                  {{ siteInfo?.stats.usedTagCount || 0 }}
                </div>
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Tags</div>
              </div>
              <div class="bg-slate-50 rounded-lg p-4 text-center border border-slate-100">
                <div class="text-2xl font-bold text-slate-800">
                  {{ siteInfo?.stats.publishedMemoCount || 0 }}
                </div>
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Memos</div>
              </div>
              <div class="bg-slate-50 rounded-lg p-4 text-center border border-slate-100">
                <div class="text-2xl font-bold text-slate-800">
                  {{ siteInfo?.stats.publishedLinkCount || 0 }}
                </div>
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Links</div>
              </div>
            </div>
          </div>

          <!-- Contact Card -->
          <div class="bento-card p-6">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Get In Touch</h4>

            <div class="space-y-3">
              <a
                  href="https://github.com"
                  target="_blank"
                  class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all group"
              >
                <Github :size="18" class="text-slate-400 group-hover:text-slate-900 transition-colors" />
                <span class="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">GitHub</span>
                <span class="ml-auto text-xs text-slate-400 font-mono">@username</span>
              </a>

              <a
                  href="https://twitter.com"
                  target="_blank"
                  class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all group"
              >
                <Twitter :size="18" class="text-slate-400 group-hover:text-slate-900 transition-colors" />
                <span class="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Twitter</span>
                <span class="ml-auto text-xs text-slate-400 font-mono">@username</span>
              </a>

              <a
                  href="mailto:hello@example.com"
                  class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all group"
              >
                <Mail :size="18" class="text-slate-400 group-hover:text-slate-900 transition-colors" />
                <span class="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Email</span>
                <span class="ml-auto text-xs text-slate-400 font-mono truncate max-w-[120px]">hello@example.com</span>
              </a>
            </div>
          </div>

          <!-- Message Card -->
          <div class="bento-card p-6">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Say Hello</h4>

            <p class="text-sm text-slate-500 leading-relaxed mb-4">
              Have a question or just want to chat? Feel free to reach out!
            </p>

            <a
                href="mailto:hello@example.com"
                class="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg text-sm font-bold transition-all"
            >
              <Send :size="14" />
              Send a Message
            </a>
          </div>

          <SiteFooter />
        </div>
      </aside>
    </div>
  </div>
</template>