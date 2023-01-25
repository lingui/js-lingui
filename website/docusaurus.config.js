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
    navbar: {
      title: '',
      logo: {
        alt: 'Lingui',
        src: 'img/logo-small.svg',
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
          'aria-label': 'GitHub repository',
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
      theme: require('prism-react-renderer/themes/github'),
      darkTheme: require('prism-react-renderer/themes/palenight'),
      additionalLanguages: ['bash', 'docker', 'gettext', 'icu-message-format', 'ignore'],
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
