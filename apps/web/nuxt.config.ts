// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/eslint',
    'shadcn-nuxt',
    '@nuxtjs/color-mode',
    'unplugin-icons/nuxt',
  ],
  app: {
    head: {
      bodyAttrs: {
        class: 'dark',
      },
      title: 'Snippy ー Snippets Manager',
    },
  },
  shadcn: {
    prefix: 'Ui',
    componentDir: '../../packages/ui/src/components/ui',
  },
});
