<template>
  <header
    class="bg-card/90 container sticky left-0 top-0 z-50 flex h-14 items-center border-x border-b px-4 backdrop-blur-sm"
  >
    <img
      src="~/assets/svg/logo.svg"
      alt="snippy"
      draggable="false"
      height="32"
      width="32"
    />
    <h2 class="ml-2 cursor-default text-lg font-semibold">Snippy</h2>
    <div class="grow"></div>
    <UiTooltipSimple as-child label="GitHub Repository">
      <UiButton variant="ghost" class="size-8 p-0 md:mr-4" as-child>
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
      </UiButton>
    </UiTooltipSimple>
    <UiButton size="sm" class="hidden text-sm md:inline-flex">
      <img
        src="~/assets/svg/windows-logo-2012-gray.svg"
        alt="windows"
        height="20"
        width="20"
      />
      Download
    </UiButton>
  </header>
</template>
<script setup lang="ts"></script>
