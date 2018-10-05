This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

See [LinguiJS documentation](https://lingui.js.org/next/index.html) for more info.

# Installation

1. Add `@lingui/react`

   ```sh
   npm install --save @lingui/react@next
   ```
   
   or
   
   ```sh
   yarn add @lingui/react@next
   ```

2. Add development dependencies `@lingui/cli`, `@lingui/macro` and Babel core packages:

   ```sh
   npm install --save-dev @lingui/cli@next @lingui/macro@next
   npm install --save-dev babel-core@^7.0.0-bridge.0 @babel/core
   ```
   
   or
   
   ```sh
   yarn add --dev @lingui/cli@next @lingui/macro@next
   yarn add --dev babel-core@^7.0.0-bridge.0 @babel/core
   ```

3. If you don't use `yarn`, add alias to `lingui` commands to `package.json`:

   ```json
   {
      "scripts": {
        "extract": "lingui extract",
        "compile": "lingui compile"
      }
   }
   ```
