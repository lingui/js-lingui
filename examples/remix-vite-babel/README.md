# Example project using Remix.run and Vite + Babel with LinguiJS Plugin

This is a [Remix.run](https://remix.run/) project that demonstrates i18n support with Lingui.

Visit the [Translate your Remix.run app with Lingui](https://www.simondepelchin.be/articles/translate-your-remix-run-app-with-lingui) article to read more about the integration.

📖 See the [Remix docs](https://remix.run/docs) and the [Remix Vite docs](https://remix.run/docs/en/main/guides/vite) for details on supported features.

## Development

Run the Vite dev server:

```shellscript
npm run dev
```

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`
