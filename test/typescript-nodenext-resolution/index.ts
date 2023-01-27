// Check support typescript's NodeNext moduleResolution with dual `@lingui` packages
// https://github.com/microsoft/TypeScript/issues/50466

import {i18n} from "@lingui/core";
import {Trans} from "@lingui/react";

console.log(i18n);
console.log(Trans);
