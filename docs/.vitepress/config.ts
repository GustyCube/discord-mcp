import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Discord MCP',
  description: 'Discord MCP server: route-generated tools + Gateway events for Model Context Protocol clients',
  base: '/discord-mcp/',
  head: [
    ['link', { rel: 'icon', href: '/discord-mcp/favicon.ico' }]
  ],
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API Reference', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/bennettschwartz/discord-mcp' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/' },
          { text: 'Configuration', link: '/configuration' },
          { text: 'Examples', link: '/examples' }
        ]
      },
      {
        text: 'Features',
        items: [
          { text: 'Route Generator', link: '/route-generator' },
          { text: 'Gateway Events', link: '/gateway' },
          { text: 'Tool Packs', link: '/packs' }
        ]
      },
      {
        text: 'Advanced',
        items: [
          { text: 'Security', link: '/security' },
          { text: 'Troubleshooting', link: '/troubleshooting' },
          { text: 'FAQ', link: '/faq' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/bennettschwartz/discord-mcp' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024'
    },

    search: {
      provider: 'local'
    }
  }
})