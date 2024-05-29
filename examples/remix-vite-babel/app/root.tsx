import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { linguiServer, localeCookie } from "./modules/lingui/lingui.server";
import { useLocale } from "./modules/lingui/lingui";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const locale = formData.get('locale') ?? 'en'

  return json(
    null,
    { headers: {
      'Set-Cookie': await localeCookie.serialize(locale)
    } },
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const locale = await linguiServer.getLocale(request);

  return json(
    {
      locale,
    },
    { headers: {
      'Set-Cookie': await localeCookie.serialize(locale)
    } },
  );
}

export type RootLoaderType = typeof loader;

export function Layout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();

  return (
    <html lang={locale ?? 'en'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
