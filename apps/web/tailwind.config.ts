import type { Config } from 'tailwindcss'
import uiConfig from '@snippy/ui/tailwind.config'

const config: Config = {
  content: [
    '../../packages/ui/src/**/*.{js,vue,ts}',
  ],
  presets: [uiConfig],
}

export default config
