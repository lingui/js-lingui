import { msg } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { Await, createFileRoute } from "@tanstack/react-router"
import { Suspense, useState } from "react"
import { personServerFn, slowServerFn } from "~/functions/deferred"

export const Route = createFileRoute("/deferred")({
  loader: async ({ context }) => {
    return {
      deferredStuff: new Promise<string>((r) =>
        setTimeout(() => r(context.i18n._(msg `Hello deferred!`)), 2000)
      ),
      deferredPerson: slowServerFn({ data: "Tanner Linsley" }),
      person: await personServerFn({ data: "John Doe" }),
    }
  },
  component: Deferred,
})

function Deferred() {
  const [count, setCount] = useState(0)
  const { deferredStuff, deferredPerson, person } = Route.useLoaderData()

  return (
    <div className="p-2">
      <div data-testid="regular-person">
        {person.name} - {person.randomNumber}
      </div>
      <Suspense
        fallback={
          <div>
            <Trans>Loading person...</Trans>
          </div>
        }
      >
        <Await
          promise={deferredPerson}
          children={(data) => (
            <div data-testid="deferred-person">
              {data.name} - {data.randomNumber}
            </div>
          )}
        />
      </Suspense>
      <Suspense
        fallback={
          <div>
            <Trans>Loading stuff...</Trans>
          </div>
        }
      >
        <Await
          promise={deferredStuff}
          children={(data) => <h3 data-testid="deferred-stuff">{data}</h3>}
        />
      </Suspense>
      <div>
        <Trans>Count: {count}</Trans>
      </div>
      <div>
        <button onClick={() => setCount(count + 1)}>
          <Trans>Increment</Trans>
        </button>
      </div>
    </div>
  )
}
