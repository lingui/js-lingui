import { t } from "@lingui/core/macro";

function getUser() {
  return 'John'
}

t`Hello ${getUser()}`