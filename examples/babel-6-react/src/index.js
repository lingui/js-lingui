import "babel-polyfill"
import * as React from "react"
import { render } from "react-dom"
import App from "./App"

const container = document.getElementById("root")

if (container !== null) {
  render(<App />, container)
}
