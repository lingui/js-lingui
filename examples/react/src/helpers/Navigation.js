import * as React from "react"
import { Dropdown, Menu } from "antd"

import { locales } from "../i18n"

export default function Navigation({ locale, activate }) {
  const menu = (
    <Menu>
      {Object.keys(locales).map(locale => (
        <Menu.Item key={locale} onClick={() => activate(locale)}>
          {locales[locale]}
        </Menu.Item>
      ))}
    </Menu>
  )
  return (
    <Dropdown overlay={menu} trigger={["click"]}>
      <a>{locales[locale]}</a>
    </Dropdown>
  )
}
