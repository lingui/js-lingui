import React from "react"

export function PluralExample({ initialValue = 1, render }) {
  const [value, setValue] = React.useState(initialValue)

  return (
    <div>
      <div>{render({ value })}</div>
      <div>
        <input
          value={value}
          type="number"
          onChange={(e) => setValue(e.target.value as any)}
        />
      </div>
    </div>
  )
}
