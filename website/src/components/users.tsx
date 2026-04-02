import React from "react";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";

interface UserDetails {
  logo: string;
  name: string;
  link: string;
}

const USERS: UserDetails[] = [
  {
    logo: "brave.png",
    name: "Brave",
    link: "https://github.com/brave/ads-ui",
  },
  {
    logo: "bluesky.png",
    name: "Bluesky",
    link: "https://github.com/bluesky-social/social-app",
  },
  {
    logo: "ansible.png",
    name: "Ansible",
    link: "https://github.com/ansible/ansible-hub-ui",
  },
  {
    logo: "metamask.png",
    name: "Metamask",
    link: "https://github.com/MetaMask/snaps-directory",
  },
  {
    logo: "twenty.png",
    name: "Twenty",
    link: "https://github.com/twentyhq/twenty",
  },
  {
    logo: "documenso.png",
    name: "Documenso",
    link: "https://github.com/documenso/documenso",
  },
  {
    logo: "graysky.png",
    name: "Graysky",
    link: "https://github.com/mozzius/graysky",
  },
  {
    logo: "linkerd.png",
    name: "Linkerd",
    link: "https://github.com/linkerd/linkerd2",
  },
  {
    logo: "zipkin.png",
    name: "Zipkin",
    link: "https://github.com/openzipkin/zipkin",
  },
  {
    logo: "fider.png",
    name: "Fider",
    link: "https://github.com/getfider/fider",
  },
  {
    logo: "remirror.png",
    name: "Remirror",
    link: "https://github.com/remirror/remirror",
  },
  {
    logo: "flood.svg",
    name: "Flood",
    link: "https://github.com/jesec/flood",
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

        <div className="mt-6 grid grid-cols-2 place-items-center gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-14 sm:gap-y-4">
          {USERS.map((user) => (
            <a
              href={user.link}
              key={user.name}
              target="_blank"
              rel="noreferrer"
              className="group flex w-1/2 flex-col items-center text-secondary no-underline hover:no-underline sm:w-auto"
            >
              <img
                className="mb-1.5 h-auto w-14 rounded-lg transition duration-200 group-hover:scale-110"
                alt={user.name}
                src={withBaseUrl(`/img/users/${user.logo}`)}
                width={64}
                height={64}
              />
              <span className="text-xs font-medium">{user.name}</span>
            </a>
          ))}
        </div>

        <a href="/misc/showroom" className="mt-6 inline-block text-base text-secondary no-underline hover:underline">
          And many more...
        </a>
      </div>
    </section>
  );
}
