<template>
  <AppHeader />
  <main class="container border-x px-0">
    <section
      class="flex flex-col place-content-center border-b px-4 py-32 text-center md:py-52"
    >
      <h1
        class="mx-auto max-w-3xl text-4xl font-bold md:text-5xl md:leading-tight"
      >
        Manage and Access to Your Snippets Quickly
      </h1>
      <p class="text-muted-foreground mx-auto mt-6 max-w-lg md:text-lg">
        Snippy is a snippets manager that will help you manage and organize your
        snippets and quickly access them.
      </p>
      <div class="mt-24">
        <UiButton size="lg"> Download for Windows </UiButton>
        <p class="text-muted-foreground mt-1 text-sm">Windows 10, 11</p>
      </div>
    </section>
    <section class="border-b">
      <UiCarousel v-slot="{ carouselApi }">
        <UiCarouselContent>
          <UiCarouselItem>
            <img src="~/assets/images/main.webp" />
          </UiCarouselItem>
          <UiCarouselItem>
            <video
              src="~/assets/videos/quick-access.mp4"
              :autoplay="carouselApi?.selectedScrollSnap() === 1"
              loop
              controls
              muted
            />
          </UiCarouselItem>
        </UiCarouselContent>
        <div class="flex items-center p-4">
          <div class="space-x-1">
            <button
              v-for="i in 2"
              :key="i"
              :aria-label="`go to page ${i + 1}`"
              class="size-3 rounded-full transition-colors"
              :class="[
                carouselApi?.selectedScrollSnap() === i - 1
                  ? 'bg-white'
                  : 'bg-muted',
              ]"
              @click="carouselApi?.scrollTo(i - 1)"
            ></button>
          </div>
          <div class="grow"></div>
          <UiCarouselPrevious
            class="relative left-0 top-0 translate-x-0 translate-y-0"
          />
          <UiCarouselNext
            class="relative left-0 top-0 ml-4 translate-x-0 translate-y-0"
          />
        </div>
      </UiCarousel>
    </section>
    <section
      class="grid grid-cols-1 divide-y border-b md:grid-cols-2 md:divide-x lg:grid-cols-4 lg:divide-y-0"
    >
      <div v-for="item in features" :key="item.id" class="p-4">
        <span class="bg-card inline-block rounded-md p-2">
          <component :is="item.icon" class="size-6" />
        </span>
        <p class="mt-1 font-medium">{{ item.title }}</p>
        <p class="text-muted-foreground mt-1 text-sm">
          {{ item.description }}
        </p>
      </div>
    </section>
  </main>
  <footer
    class="container flex h-24 items-center justify-between border-x px-4"
  >
    <img
      src="~/assets/svg/logo.svg"
      alt="snippy"
      height="42"
      width="42"
      draggable="false"
      class="border-border/30 rounded-md border"
    />
    <a
      href="https://github.com/kholid060/snippy"
      target="_blank"
      rel="noopener"
    >
      <img
        src="~/assets/svg/github-mark-white.svg"
        alt="github"
        height="20"
        width="20"
      />
    </a>
  </footer>
</template>
<script setup lang="ts">
import {
  FolderFileStorageIcon,
  BrowserIcon,
  FileSyncIcon,
} from 'hugeicons-vue';
import githubMarkWhite from '~/assets/svg/github-mark-white.svg';

const features: {
  id: string;
  title: string;
  icon: Component;
  description: string;
}[] = [
  {
    id: '1',
    icon: FolderFileStorageIcon,
    title: 'Snippet Management',
    description: 'Easily organize your snippets with folders and bookmarks.',
  },
  {
    id: '2',
    icon: BrowserIcon,
    title: 'Quick Access Window',
    description:
      'Quickly access your snippets, and bookmarks, or create a new snippet.\nUse Ctrl+Shift+K to open it.',
  },
  {
    id: '3',
    icon: () => h('img', { src: githubMarkWhite, alt: 'GitHub' }),
    title: 'Share to or Import GitHub Gist',
    description: 'Import GitHub Gist or share your snippets to GitHub Gist.',
  },
  {
    id: '4',
    icon: FileSyncIcon,
    title: 'Sync',
    description:
      'Sync your snippets across devices with cloud sync services such as Dropbox, Google Drive, etc.',
  },
];
</script>
