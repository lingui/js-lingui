import { useState } from 'react'
import { Trans, Plural } from '@lingui/macro'

export default function Developers() {
  const [selected, setSelected] = useState('1')
  return (
    <div>
      <p>
        <Trans>Plural Test: How many developers?</Trans>
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
        <select
          value={selected}
          onChange={(evt) => setSelected(evt.target.value)}
        >
          <option value={'1'}>1</option>
          <option value={'2'}>2</option>
        </select>
        <p>
          <Plural value={selected} one={'Developer'} other={`Developers`} />
        </p>
      </div>
    </div>
  )
}
