import React from "react";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";

interface UserDetails {
  logo: string;
  name: string;
  link: string;
  background?: string;
}

const USERS: UserDetails[] = [
  {
    logo: "elevenlabs.png",
    name: "ElevenLabs",
    link: "https://elevenlabs.io",
    background: "#ffffff",
  },
  {
    logo: "bluesky.png",
    name: "Bluesky",
    link: "https://github.com/bluesky-social/social-app",
  },
  {
    logo: "gamma.png",
    name: "Gamma",
    link: "https://gamma.app",
  },
  {
    logo: "twenty.png",
    name: "Twenty",
    link: "https://github.com/twentyhq/twenty",
  },
  {
    logo: "superset.png",
    name: "Superset",
    link: "https://github.com/superset-sh/superset",
  },
  {
    logo: "documenso.png",
    name: "Documenso",
    link: "https://github.com/documenso/documenso",
  },
  {
    logo: "reactive-resume.png",
    name: "Reactive Resume",
    link: "https://github.com/AmruthPillai/Reactive-Resume",
  },
  {
    logo: "gdevelop.png",
    name: "GDevelop",
    link: "https://github.com/4ian/GDevelop",
  },
  {
    logo: "notesnook.png",
    name: "Notesnook",
    link: "https://github.com/streetwriters/notesnook",
  },
  {
    logo: "fluxer.png",
    name: "Fluxer",
    link: "https://github.com/fluxerapp/fluxer",
  },
  {
    logo: "inkeep.png",
    name: "Inkeep",
    link: "https://github.com/inkeep/open-knowledge",
  },
  {
    logo: "linkerd.png",
    name: "Linkerd",
    link: "https://github.com/linkerd/linkerd2",
  },
];

export function Users(): React.ReactElement {
  const { withBaseUrl } = useBaseUrlUtils();

  return (
    <section className="bg-zinc-100/70 dark:bg-zinc-800/70 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="mb-12 text-center text-3xl font-medium tracking-tight text-heading sm:text-4xl">
          Loved by hundreds of teams worldwide
        </h2>

        <div className="mx-auto mt-6 grid max-w-4xl grid-cols-2 place-items-center gap-x-3 gap-y-6 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-8">
          {USERS.map((user) => (
            <a
              href={user.link}
              key={user.name}
              target="_blank"
              rel="noreferrer"
              className="group flex w-28 flex-col items-center text-secondary no-underline hover:no-underline"
            >
              <img
                className="mb-1.5 h-14 w-14 rounded-lg object-contain transition duration-200 group-hover:scale-110"
                alt={user.name}
                src={withBaseUrl(`/img/users/${user.logo}`)}
                style={user.background ? { backgroundColor: user.background } : undefined}
                width={64}
                height={64}
              />
              <span className="text-xs font-medium">{user.name}</span>
            </a>
          ))}
        </div>

        <a href="/misc/showroom" className="mt-8 inline-block text-base text-secondary no-underline hover:underline">
          And many more...
        </a>
      </div>
    </section>
  );
}
