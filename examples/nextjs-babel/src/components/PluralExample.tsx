import { ReactNode, useState } from "react"

type Props = {
  initialValue?: number
  render: (props: { value: number }) => ReactNode
}

export function PluralExample({ initialValue = 1, render }: Props) {
  const [value, setValue] = useState(initialValue)

  return (
    <div>
      <div>{render({ value })}</div>
      <div>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
        />
      </div>
    </div>
  )
}
