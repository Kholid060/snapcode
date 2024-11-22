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
  ],
  shadcn: {
    prefix: 'Ui',
    componentDir: '../../packages/ui/src/components/ui',
  },
})
