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
    logo: "lenster.svg",
    name: "Lenster",
    link: "https://github.com/lensterxyz/lenster",
  },
  {
    logo: "ansible.png",
    name: "Ansible AWX",
    link: "https://github.com/ansible/awx",
  },
  {
    logo: "linkerd.png",
    name: "Linkerd",
    link: "https://github.com/linkerd/linkerd2",
  },
  {
    logo: "uniswap.png",
    name: "Uniswap",
    link: "https://github.com/Uniswap/interface",
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
              <a href={user.link} key={idx} target="_blank" rel="noreferrer" className={styles.user}>
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

          <p className={styles.muted}>And many more...</p>
        </div>
      </div>
    </section>
  );
};

export default Users;
