import * as React from "react"

export default function Lingui({ numUsers, name = "You" }) {
  return (
    <div>
      <h1>Internationalization in React</h1>

      <img src="./logo.png" alt="Logo of Lingui Project" />

      <p className="lead">
        Hello {name}, LinguiJS is a readable, automated, and optimized (5 kb)
        internationalization for JavaScript.
      </p>

      <p>
        Read the <a href="https://lingui.js.org">documentation</a>
        for more info.
      </p>

      {numUsers === 1 ? (
        <span>
          Only <strong>one</strong> user is using this library!
        </span>
      ) : (
        <span>
          <strong>{numUsers}</strong> users are using this library!
        </span>
      )}
    </div>
  )
}
