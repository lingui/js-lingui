import { replaceRootDir } from "./replaceRootDir"

it("should replace <rootDir>", () => {
  const config = replaceRootDir(
    {
      compileNamespace: "cjs",
      catalogs: [
        {
          path: "/",
          include: ["<rootDir>/src"],
          exclude: ["<rootDir>/ignored"],
        },
      ],
    },
    "/Root",
  )

  expect(config).toMatchObject({
    compileNamespace: "cjs",
    catalogs: [
      {
        path: "/",
        include: ["/Root/src"],
        exclude: ["/Root/ignored"],
      },
    ],
  })
})

it("should not mutate the passed config", () => {
  const catalog = { path: "<rootDir>/locales", include: ["<rootDir>/src"] }
  const config = replaceRootDir({ catalogs: [catalog] }, "/Root")

  expect(config.catalogs![0]).toEqual({
    path: "/Root/locales",
    include: ["/Root/src"],
  })
  expect(catalog).toEqual({
    path: "<rootDir>/locales",
    include: ["<rootDir>/src"],
  })
})
