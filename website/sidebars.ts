const sidebar = [
  {
    type: 'doc',
    label: 'Introduction',
    id: 'introduction',
  },
  {
    type: 'category',
    label: 'Installation',
    items: [
      {
        type: 'doc',
        label: 'Create React App',
        id: 'tutorials/setup-cra',
      },
      {
        type: 'doc',
        label: 'React project',
        id: 'tutorials/setup-react',
      },
      {
        type: 'doc',
        label: 'Vite project',
        id: 'tutorials/setup-vite',
      },
    ],
  },
  {
    type: 'category',
    label: 'Tutorials',
    items: [
      {
        type: 'doc',
        label: 'React',
        id: 'tutorials/react',
      },
      {
        type: 'doc',
        label: 'React - common patterns',
        id: 'tutorials/react-patterns',
      },
      {
        type: 'doc',
        label: 'React Native',
        id: 'tutorials/react-native',
      },
      {
        type: 'doc',
        label: 'JavaScript',
        id: 'tutorials/javascript',
      },
      {
        type: 'doc',
        label: 'CLI',
        id: 'tutorials/cli',
      },
      {
        type: 'doc',
        label: 'Extracting Vue.js messages',
        id: 'tutorials/extractor-vue',
      },
    ],
  },
  {
    type: 'category',
    label: 'Guides',
    items: [
      {
        type: 'doc',
        id: 'guides/message-extraction',
      },
      {
        type: 'doc',
        label: 'Testing',
        id: 'guides/testing',
      },
      {
        type: 'doc',
        label: 'TypeScript',
        id: 'guides/typescript',
      },
      {
        type: 'doc',
        id: 'guides/flow',
      },
      {
        type: 'doc',
        label: 'Excluding build files',
        id: 'guides/excluding-build-files',
      },
      {
        type: 'doc',
        label: 'Dynamic loading',
        id: 'guides/dynamic-loading-catalogs',
      },
      {
        type: 'doc',
        label: 'Pluralization',
        id: 'guides/plurals',
      },
      {
        type: 'doc',
        label: 'Monorepo',
        id: 'guides/monorepo',
      },
      {
        type: 'doc',
        label: 'Pseudolocalization',
        id: 'guides/pseudolocalization',
      },
      {
        type: 'category',
        label: 'Advanced',
        items: [
          {
            type: 'doc',
            id: 'guides/custom-extractor',
          },
          {
            type: 'doc',
            id: 'guides/custom-formatter',
          },
        ],
      },
    ],
  },
  {
    type: 'category',
    label: 'API Reference',
    items: [
      {
        type: 'doc',
        label: '@lingui/core',
        id: 'ref/core',
      },
      {
        type: 'doc',
        label: '@lingui/react',
        id: 'ref/react',
      },
      {
        type: 'doc',
        label: '@lingui/macro',
        id: 'ref/macro',
      },
      {
        type: 'doc',
        label: '@lingui/cli',
        id: 'ref/cli',
      },
      {
        type: 'doc',
        label: '@lingui/locale-detector',
        id: 'ref/locale-detector',
      },
      {
        type: 'doc',
        label: '@lingui/loader',
        id: 'ref/loader',
      },
      {
        type: 'doc',
        label: 'Lingui Configuration',
        id: 'ref/conf',
      },
      {
        type: 'doc',
        label: 'Catalog formats',
        id: 'ref/catalog-formats',
      },
      {
        type: 'doc',
        label: 'ICU MessageFormat',
        id: 'ref/message-format',
      },
    ],
  },
  {
    type: 'category',
    label: 'Plugins',
    items: [
      {
        type: 'doc',
        label: '@lingui/swc-plugin',
        id: 'ref/swc-plugin',
      },
      {
        type: 'doc',
        label: '@lingui/vite-plugin',
        id: 'ref/vite-plugin',
      },
    ],
  },
  {
    type: 'category',
    label: 'Sync & Collaboration Tools',
    items: ['tools/introduction', 'tools/crowdin', 'tools/translation-io'],
  },
  {
    type: 'category',
    label: 'Resources',
    items: ['misc/community', 'misc/resources', 'misc/showroom', 'misc/react-intl', 'misc/tooling'],
  },
  {
    type: 'category',
    label: 'Releases',
    items: ['releases/migration-4', 'releases/migration-3'],
  },
];

module.exports = {
  sidebar,
};
