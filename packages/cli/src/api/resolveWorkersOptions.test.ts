import type { Mock } from "jest-mock"

jest.mock("node:os", () => ({ availableParallelism: jest.fn() }))

import os from "node:os"
import { resolveWorkerOptions } from "./resolveWorkersOptions"

const mockAvail = os.availableParallelism as unknown as Mock<
  typeof os.availableParallelism
>
const setCores = (n: number) => mockAvail.mockReturnValue(n)

describe("resolveWorkerOptions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("noWorkers forces single-threaded", () => {
    setCores(8)
    expect(resolveWorkerOptions({ noWorkers: true })).toEqual({
      multiThread: false,
    })
  })

  test("workers=1 forces single-threaded", () => {
    setCores(8)
    expect(resolveWorkerOptions({ workers: 1 })).toEqual({ multiThread: false })
  })

  test("cores=1 → single-threaded even without flags", () => {
    setCores(1)
    expect(resolveWorkerOptions({})).toEqual({ multiThread: false })
  })

  test("default on tiny machine (cores=2) uses all cores", () => {
    setCores(2)
    expect(resolveWorkerOptions({})).toEqual({ multiThread: true, poolSize: 2 })
  })

  test("default on small machine (cores=3) uses cores-1", () => {
    setCores(3)
    expect(resolveWorkerOptions({})).toEqual({ multiThread: true, poolSize: 2 })
  })

  test("default caps to 8 on big machines (cores=32)", () => {
    setCores(32)
    expect(resolveWorkerOptions({})).toEqual({ multiThread: true, poolSize: 8 })
  })

  test("default on mid machine (cores=4) → 3 threads", () => {
    setCores(4)
    expect(resolveWorkerOptions({})).toEqual({ multiThread: true, poolSize: 3 })
  })

  test("explicit workers value wins over cores (even if > cap)", () => {
    setCores(4)
    expect(resolveWorkerOptions({ workers: 5 })).toEqual({
      multiThread: true,
      poolSize: 5,
    })
  })
})
