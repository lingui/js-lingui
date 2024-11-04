import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import { themes } from "prism-react-renderer";

const config: Config = {
  title: "Lingui",
  tagline: "Internationalization Framework for Global Products",
  url: process.env["SITE_URL"] || "https://lingui.dev",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  organizationName: "lingui",
  onBrokenLinks: "throw",
  onBrokenAnchors: "throw",
  onBrokenMarkdownLinks: "throw",
  themeConfig: {
    colorMode: {
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    announcementBar: {
      id: "v5_release",
      content:
        'The <b>v5.0.0</b> Pre-Release is here, <a target="_blank" rel="noopener noreferrer" href="https://github.com/lingui/js-lingui/releases?q=tag%3Av5&expanded=true">discover its new capabilities!</a>',
      backgroundColor: "#f36c6c",
      textColor: "#1a1a1a",
    },
    metadata: [
      {
        name: "title",
        content: "Lingui - Internationalization Framework for Global Products",
      },
      {
        name: "description",
        content:
          "Lingui is a modern internationalization framework for global products. It provides the best developer experience for managing translations and supports all major frameworks.",
      },
      {
        name: "keywords",
        content:
          "internationalization, localization, multilingual, translation, i18n, l10n, react, react native, vue, next.js, ICU, javascript, typescript, pseudolocalization, internationalization framework",
      },
    ],
    navbar: {
      title: "",
      logo: {
        alt: "Lingui",
        src: "img/logo-small.svg",
        width: "48px",
        height: "48px",
      },
      items: [
        {
          to: "/introduction",
          label: "Docs",
          position: "left",
        },
        {
          to: "/examples",
          label: "Examples",
          position: "left",
        },
        {
          to: "/blog",
          label: "Blog",
          position: "left",
        },
        {
          to: "/community",
          label: "Community",
          position: "left",
        },
        {
          href: "https://github.com/lingui/js-lingui",
          position: "right",
          className: "header-github-link",
          title: "GitHub repository",
          "aria-label": "GitHub repository",
        },
        {
          href: "https://discord.gg/gFWwAYnMtA",
          position: "right",
          className: "header-discord-link",
          title: "Discord",
          "aria-label": "Discord",
        },
      ],
    },
    footer: {
      style: "dark",
      copyright: `Copyright © 2017-2022 Tom Ehrlich, © 2022-${new Date().getFullYear()} Crowdin.`,
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Introduction",
              to: "/introduction/",
            },
            {
              label: "CLI Reference",
              to: "/ref/cli",
            },
            {
              label: "Configuration",
              to: "/ref/conf",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Discord",
              href: "https://discord.gg/gFWwAYnMtA",
            },
            {
              label: "Stack Overflow",
              href: "https://stackoverflow.com/questions/tagged/linguijs",
            },
            {
              label: "Discussions",
              href: "https://github.com/lingui/js-lingui/discussions",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "Blog",
              to: "/blog",
            },
            {
              label: "X",
              href: "https://x.com/LinguiJS",
            },
            {
              label: "GitHub",
              href: "https://github.com/lingui/js-lingui",
            },
          ],
        },
      ],
    },
    algolia: {
      appId: "JJFVB18YWS",
      apiKey: "50e12ed6fd44188e9abd4e0e9d2cb935",
      indexName: "lingui",
    },
    blog: {
      sidebar: {
        groupByYear: false,
      },
    },
    prism: {
      theme: themes.github,
      darkTheme: themes.dracula,
      additionalLanguages: ["bash", "json", "gettext", "icu-message-format", "ignore", "diff"],
    },
  } satisfies Preset.ThemeConfig,
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.ts"),
          sidebarCollapsible: false,
          breadcrumbs: false,
          routeBasePath: "/",
          editUrl: "https://github.com/lingui/js-lingui/tree/main/website",
          remarkPlugins: [
            [require("@docusaurus/remark-plugin-npm2yarn"), { sync: true, converters: ["yarn", "pnpm"] }],
          ],
        },
        blog: {
          showReadingTime: true,
          editUrl: "https://github.com/lingui/js-lingui/tree/main/website/",
        },
        sitemap: {
          priority: 0.5,
          filename: "sitemap.xml",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.scss"),
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: ["docusaurus-plugin-sass"],
};

export default config;
