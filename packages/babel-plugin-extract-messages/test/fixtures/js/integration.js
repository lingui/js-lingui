import { t } from "@lingui/macro"

const a = i18n._(t`msg.hello`)
i18n._(t`msg.hello`)
i18n._(t({id: 'customId', context: 'customContext'})`Hello World`)
i18n._(t({context: "Context without id"})`Hello World`)