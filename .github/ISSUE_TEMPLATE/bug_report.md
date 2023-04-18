---
name: Bug report
about: Create a report to help us improve

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior, possibly with minimal code sample, e.g:

```tsx
import { Trans } from "@lingui/react"

export default function App() {
   return <Trans>This should be translated!</Trans>
}
```

**Expected behavior**
A clear and concise description of what you expected to happen.

**Additional context**
Add any other context about the problem here.

- jsLingui version ``lingui --version``
- Babel version ``npm list @babel/core``
- Macro support:
 - [ ] I'm using SWC with `@lingui/swc-plugin`
 - [ ] I'm using Babel with `babel-macro-plugin`
 - [ ] I'm not using macro
- Your Babel config (e.g. `.babelrc`) or framework you use (Create React App, NextJs, Vite)
