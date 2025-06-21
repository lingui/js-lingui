# Lingui Documentation Website

This website is built using [Docusaurus](https://docusaurus.io/) and includes versioned documentation.

## Development

```bash
# Install dependencies
yarn install

# Start development server
yarn start

# Build for production
yarn build

# Serve production build
yarn serve
```

## Versioning

```bash
# Create version from current docs/
yarn docusaurus docs:version VERSION_NUMBER
```

## Structure

```text
website/
├── docs/                           # Current version documentation
│   ├── assets/                     # Current version images
│   └── ...                         # Other documentation files
├── versioned_docs/
│   └── version-x.x/                # Legacy documentation for x.x (unmaintained)
│       └── ...                     # Same structure as docs/
├── versioned_sidebars/
│   └── version-x.x-sidebars.json   # Legacy navigation for x.x
├── blog/                           # Blog posts
│   ├──  ...
│   └── authors.yml                 # Blog authors
├── src/
│   ├── pages/                      # Non-versioned static pages
│   │   ├── examples.md             # Examples page
│   │   ├── community.md            # Community page
│   │   └── index.tsx               # Homepage
│   ├── components/                 # React components
│   └── css/                        # Custom styles
├── static/
│   ├── img/
│   │   ├── features/               # Feature section images
│   │   └── ...                     # Global assets (logos, favicons)
│   └── ...
├── docusaurus.config.ts            # Main configuration
├── sidebars.ts                     # Current documentation navigation
└── versions.json                   # Available versions list
```


