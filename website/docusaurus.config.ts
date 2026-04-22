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
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "throw",
    },
  },
  themes: ["@docusaurus/theme-mermaid"],
  themeConfig: {
    colorMode: {
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    announcementBar: {
      id: "lingui-6.0",
      content: `🚀  Lingui <strong>6.0</strong> is now available. <a href="/blog/2026/04/22/announcing-lingui-6.0">Read the release announcement</a> for what's new. ✨`,
      backgroundColor: "#0d9488",
      textColor: "#ffffff",
      isCloseable: true,
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
          href: "https://discord.gg/tBZqKpeF",
          position: "right",
          className: "header-discord-link",
          title: "Discord",
          "aria-label": "Discord",
        },
        {
          href: "https://x.com/LinguiJS",
          position: "right",
          className: "header-x-link",
          title: "X",
          "aria-label": "X",
        },
      ],
    },
    footer: {
      style: "dark",
      copyright: `Copyright © 2017-2022 Tom Ehrlich, © 2022-${new Date().getFullYear()} Crowdin.`,
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
  plugins: [
    "docusaurus-plugin-sass",
    [
      "@signalwire/docusaurus-plugin-llms-txt",
      {
        content: {
          enableLlmsFullTxt: true,
          excludeRoutes: ["/", "/search", "/community", "/misc/*", "/releases/*"],
        },
        includeOrder: ["/installation", "/tutorials/**", "/guides/**", "/ref/**", "/examples/**"],
      },
    ],
  ],
};

export default config;
