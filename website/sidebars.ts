const sidebar = [
  {
    type: "category",
    label: "Getting Started",
    items: [
      {
        type: "doc",
        label: "Introduction",
        id: "introduction",
      },
      {
        type: "doc",
        label: "Installation and Setup",
        id: "installation",
      },
    ],
  },
  {
    type: "category",
    label: "Tutorials",
    items: [
      {
        type: "doc",
        label: "React",
        id: "tutorials/react",
      },
      {
        type: "doc",
        label: "React Server Components",
        id: "tutorials/react-rsc",
      },
      {
        type: "doc",
        label: "React Native",
        id: "tutorials/react-native",
      },
      {
        type: "doc",
        label: "React - Common Patterns",
        id: "tutorials/react-patterns",
      },
      {
        type: "doc",
        label: "JavaScript",
        id: "tutorials/javascript",
      },
    ],
  },
  {
    type: "category",
    label: "Guides",
    items: [
      {
        type: "doc",
        label: "Message Extraction",
        id: "guides/message-extraction",
      },
      {
        type: "doc",
        label: "Explicit vs Generated IDs",
        id: "guides/explicit-vs-generated-ids",
      },
      {
        type: "doc",
        label: "Lazy Translations",
        id: "guides/lazy-translations",
      },
      {
        type: "doc",
        label: "Pseudolocalization",
        id: "guides/pseudolocalization",
      },
      {
        type: "doc",
        label: "Dynamic Loading",
        id: "guides/dynamic-loading-catalogs",
      },
      {
        type: "doc",
        label: "Pluralization",
        id: "guides/plurals",
      },
      {
        type: "doc",
        label: "Testing",
        id: "guides/testing",
      },
      {
        type: "doc",
        label: "Monorepo",
        id: "guides/monorepo",
      },
      {
        type: "doc",
        label: "ICU MessageFormat",
        id: "guides/message-format",
      },
    ],
  },
  {
    type: "category",
    label: "API Reference",
    items: [
      {
        type: "doc",
        label: "Configuration",
        id: "ref/conf",
      },
      {
        type: "doc",
        label: "Catalog Formats",
        id: "ref/catalog-formats",
      },
      {
        type: "doc",
        label: "@lingui/core",
        id: "ref/core",
      },
      {
        type: "doc",
        label: "@lingui/react",
        id: "ref/react",
      },
      {
        type: "doc",
        label: "@lingui/macro",
        id: "ref/macro",
      },
      {
        type: "doc",
        label: "@lingui/cli",
        id: "ref/cli",
      },
      {
        type: "doc",
        label: "@lingui/locale-detector",
        id: "ref/locale-detector",
      },
      {
        type: "doc",
        label: "@lingui/loader",
        id: "ref/loader",
      },
      {
        type: "doc",
        label: "@lingui/metro-transformer",
        id: "ref/metro-transformer",
      },
      {
        type: "doc",
        label: "@lingui/extractor-vue",
        id: "ref/extractor-vue",
      },
      {
        type: "category",
        label: "Advanced",
        items: [
          {
            type: "doc",
            label: "Custom Extractor",
            id: "guides/custom-extractor",
          },
          {
            type: "doc",
            label: "Custom Formatter",
            id: "guides/custom-formatter",
          },
        ],
      },
    ],
  },
  {
    type: "category",
    label: "Tooling",
    items: [
      {
        type: "doc",
        label: "SWC Plugin",
        id: "ref/swc-plugin",
      },
      {
        type: "doc",
        label: "Vite Plugin",
        id: "ref/vite-plugin",
      },
      {
        type: "doc",
        label: "ESLint Plugin",
        id: "ref/eslint-plugin",
      },
    ],
  },
  {
    type: "category",
    label: "Sync & Collaboration Tools",
    items: [
      {
        type: "doc",
        label: "Introduction",
        id: "tools/introduction",
      },
      {
        type: "doc",
        label: "Crowdin",
        id: "tools/crowdin",
      },
      {
        type: "doc",
        label: "Translation.io",
        id: "tools/translation-io",
      },
    ],
  },
  {
    type: "category",
    label: "Resources",
    items: ["misc/community", "misc/resources", "misc/tooling", "misc/showroom", "misc/react-intl", "misc/i18next"],
  },
  {
    type: "category",
    label: "Releases",
    items: ["releases/migration-5", "releases/migration-4", "releases/migration-3"],
  },
];

module.exports = {
  sidebar,
};
