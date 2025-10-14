# React Webpack Po-Gettext Example

This is a simple example of using React with Webpack and Lingui's po-gettext formatter for internationalization using compiled JavaScript files.

## Features

- **Simple Webpack Setup**: Minimal webpack configuration for React and TypeScript
- **Po-Gettext Format**: Uses GNU gettext .po files for translations
- **Compiled JS Loading**: Translations are compiled to JavaScript files and loaded via script tags
- **Global Namespace**: Uses `window.i18njs` namespace for compiled translations
- **Complete i18n Features**: Includes pluralization, date/number formatting, and dynamic language switching

## Getting Started

1. Install dependencies:
```bash
yarn install
# or
npm install
```

2. Extract translatable strings and compile them:
```bash
yarn extract
yarn compile
# or
npm run extract
npm run compile
```

3. Start the development server (this will automatically extract and compile):
```bash
yarn start
# or
npm start
```

The application will be available at http://localhost:3000

## Building for Production

```bash
yarn build
# or
npm run build
```

## Project Structure

```
src/
├── App.tsx          # Main React component with i18n examples
├── App.css          # Styling
├── index.tsx        # Application entry point
├── i18n.ts          # i18n configuration and dynamic loading
├── types.d.ts       # TypeScript declarations for .po files
└── locales/         # Generated translation files
    ├── en.po        # English translations
    └── cs.po        # Czech translations
```

## Key Configuration

- **lingui.config.js**: Configures po-gettext formatter with `compileNamespace: "window.i18njs"`
- **webpack.config.js**: Simple webpack setup with CopyWebpackPlugin to copy compiled JS files
- **.babelrc**: Babel configuration with lingui macro plugin
- **tsconfig.json**: TypeScript configuration for React
- **public/index.html**: Includes script tags to load compiled translation files

## How it Works

1. **Extract**: `lingui extract` extracts translatable strings to .po files
2. **Compile**: `lingui compile` compiles .po files to JavaScript files in `src/locales/`
3. **Load**: Compiled JS files are copied to `dist/locales/` and loaded via script tags
4. **Access**: Translations are available at `window.i18njs[locale]` and loaded by the React app

## Differences from create-react-app Example

- Uses simple webpack instead of create-react-app
- Compiled JS files loaded via script tags instead of dynamic imports
- Uses global namespace (`window.i18njs`) for translations
- No webpack loader needed for .po files
- Minimal dependencies and configuration
