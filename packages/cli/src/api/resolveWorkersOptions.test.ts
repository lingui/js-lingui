import type { Mock } from "jest-mock"

jest.mock("node:os", () => ({ availableParallelism: jest.fn() }))

import os from "node:os"
import { resolveWorkersOptions } from "./resolveWorkersOptions"

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
    expect(resolveWorkersOptions({ workers: false })).toEqual({
      poolSize: 0,
    })
  })

  test("workers=1 forces single-threaded", () => {
    setCores(8)
    expect(resolveWorkersOptions({ workers: 1 })).toEqual({
      poolSize: 0,
    })
  })

  test("workers < 1 forces single-threaded", () => {
    setCores(8)
    expect(resolveWorkersOptions({ workers: -1 })).toEqual({
      poolSize: 0,
    })
  })

  test("cores=1 → single-threaded even without flags", () => {
    setCores(1)
    expect(resolveWorkersOptions({})).toEqual({ poolSize: 0 })
  })

  test("default on tiny machine (cores=2) uses all cores", () => {
    setCores(2)
    expect(resolveWorkersOptions({})).toEqual({
      poolSize: 2,
    })
  })

  test("default on small machine (cores=3) uses cores-1", () => {
    setCores(3)
    expect(resolveWorkersOptions({})).toEqual({
      poolSize: 2,
    })
  })

  test("default caps to 8 on big machines (cores=32)", () => {
    setCores(32)
    expect(resolveWorkersOptions({})).toEqual({
      poolSize: 8,
    })
  })

  test("default on mid machine (cores=4) → 3 threads", () => {
    setCores(4)
    expect(resolveWorkersOptions({})).toEqual({
      poolSize: 3,
    })
  })

  test("explicit workers value wins over cores (even if > cap)", () => {
    setCores(4)
    expect(resolveWorkersOptions({ workers: 5 })).toEqual({
      poolSize: 5,
    })
  })
})
