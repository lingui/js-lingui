import * as React from "react"
import { Dropdown, Menu } from "antd"

import { withI18n } from "@lingui/react"
import { locales } from "../i18n"

function Navigation({ i18n }) {
  const menu = (
    <Menu>
      {Object.keys(locales).map(locale => (
        <Menu.Item key={locale} onClick={() => i18n.activate(locale)}>
          {locales[locale]}
        </Menu.Item>
      ))}
    </Menu>
  )
  return (
    <Dropdown overlay={menu} trigger={["click"]}>
      <a>{locales[i18n.locale]}</a>
    </Dropdown>
  )
}

export default withI18n(Navigation)
