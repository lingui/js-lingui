import React from "react";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import clsx from "clsx";

import styles from "./Users.module.scss";

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

const Users = (): React.ReactElement => {
  const { withBaseUrl } = useBaseUrlUtils();

  return (
    <section className={clsx(styles.users, "padding-horiz--lg")}>
      <div className={clsx(styles.usersHolder, "padding-horiz--lg")}>
        <div className="container text--center">
          <h2>Loved by hundreds of teams, including:</h2>
          <div className={clsx("row", styles.usersList)}>
            {USERS.map((user, idx) => (
              <a
                href={user.link}
                key={idx}
                target="_blank"
                rel="noreferrer"
                className={clsx(styles.user, "text--secondary")}
              >
                <img
                  className={clsx(styles.logo, "margin-bottom--sm")}
                  alt={user.name}
                  src={withBaseUrl(`/img/users/${user.logo}`)}
                  width="64px"
                  height="64px"
                />
                <p>{user.name}</p>
              </a>
            ))}
          </div>

          <a href="/misc/showroom">And many more...</a>
        </div>
      </div>
    </section>
  );
};

export default Users;
