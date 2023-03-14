import { t } from "@lingui/macro"

@Decorator()
export class TestDecorator {
  // supports typescript legacy decorator on parameters
  constructor(@Decorator() param) {}

  @Decorator()
  prop

  @Decorator()
  method() {}
}

t`Message`
