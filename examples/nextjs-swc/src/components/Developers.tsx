'use client'
// This is a Client Component because it keeps state with `useState`.
// Macros work the same way in Client and Server Components.

import { useState } from 'react'
import { Plural, Trans } from '@lingui/react/macro'

export function Developers() {
  const [count, setCount] = useState(1)

  return (
    <div>
      <p>
        <label>
          <Trans>How many developers?</Trans>{' '}
          <input
            type="number"
            min={0}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          />
        </label>
      </p>
      <p>
        <Plural value={count} one="# developer" other="# developers" />
      </p>
    </div>
  )
}
