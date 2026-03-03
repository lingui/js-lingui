# React Webpack Po-Gettext Example

This is a simple example of using React with Webpack and Lingui's po-gettext formatter for internationalization using compiled JavaScript files.

## Settings/Example highlights

- **PO Gettext Format**: using [po-gettext](https://lingui.dev/ref/catalog-formats#po-gettext) formatter for plurals
- **Simple Webpack Setup**: Minimal webpack configuration for React and TypeScript
- **Dynamic loading**: loads using JSON catalog dynamically

## Getting Started

1. Install dependencies:
```bash
yarn install
```

2. Start the development server (this will automatically extract and compile):
```bash
yarn start
```

The application will be available at http://localhost:3000

## Building for Production

```bash
yarn build
```

## Key Configuration

- **lingui.config.js**: Configures po-gettext formatter and JSON compile
- **webpack.config.js**: Simple webpack setup with CopyWebpackPlugin to copy compiled JSON files
