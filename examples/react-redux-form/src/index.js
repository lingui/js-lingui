// @flow
import React from "react"
import { render } from "react-dom"
import { Provider } from "react-redux"

import store from "./store"
import App from "./App"

const container = document.getElementById("root")

if (container !== null) {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    container
  )
}
