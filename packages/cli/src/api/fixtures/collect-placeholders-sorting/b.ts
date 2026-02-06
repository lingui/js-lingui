import { t } from "@lingui/core/macro"

function getWorld() {
  return "John"
}

t`Hello ${getWorld()}`