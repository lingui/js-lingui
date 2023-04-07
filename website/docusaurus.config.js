const copyright = `Copyright © 2017-2022 Tom Ehrlich, © 2022-${new Date().getFullYear()} Crowdin.`;
const url = process.env['SITE_URL'] || 'https://lingui.dev';

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Lingui',
  tagline: 'Internationalization Framework for Global Products',
  url: url,
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'lingui',
  themeConfig: {
    colorMode: {
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    announcementBar: {
      id: 'new_release',
      content:
        'The v4.0.0 Pre-release is here, <a target="_blank" rel="noopener noreferrer" href="https://github.com/lingui/js-lingui/releases?q=v4.0.0">discover its new capabilities!</a>',
      backgroundColor: '#ef4242',
      textColor: '#FFFFFF',
      isCloseable: true,
    },
    navbar: {
      title: '',
      logo: {
        alt: 'Lingui',
        src: 'img/logo-small.svg',
        width: '48px',
        height: '48px',
      },
      items: [
        {
          to: '/introduction',
          label: 'Docs',
          position: 'left',
        },
        {
          to: '/misc/community',
          label: 'Community',
          position: 'left',
        },
        {
          href: 'https://github.com/lingui/js-lingui',
          position: 'right',
          className: 'header-github-link',
          title: 'GitHub repository',
          'aria-label': 'GitHub repository',
        },
        {
          href: 'https://discord.gg/gFWwAYnMtA',
          position: 'right',
          className: 'header-discord-link',
          title: 'Discord',
          'aria-label': 'Discord',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright,
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: '/introduction/',
            },
            {
              label: 'CLI Reference',
              to: '/ref/cli',
            },
            {
              label: 'Configuration',
              to: '/ref/conf',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/gFWwAYnMtA',
            },
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/linguijs',
            },
            {
              label: 'Discussions',
              href: 'https://github.com/lingui/js-lingui/discussions',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/lingui/js-lingui',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/LinguiJS',
            },
            {
              label: 'ICU Playground',
              href: 'https://format-message.github.io/icu-message-format-for-translators/editor.html',
            },
          ],
        },
      ],
    },
    algolia: {
      appId: 'JJFVB18YWS',
      apiKey: '50e12ed6fd44188e9abd4e0e9d2cb935',
      indexName: 'lingui',
    },
    prism: {
      additionalLanguages: ['bash', 'gettext', 'icu-message-format', 'ignore'],
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.ts'),
          sidebarCollapsible: false,
          breadcrumbs: false,
          routeBasePath: '/',
          editUrl: 'https://github.com/lingui/js-lingui/tree/main/website',
          remarkPlugins: [[require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }]],
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          filename: 'sitemap.xml',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.scss'),
        },
      },
    ],
  ],
  plugins: ['docusaurus-plugin-sass'],
};
