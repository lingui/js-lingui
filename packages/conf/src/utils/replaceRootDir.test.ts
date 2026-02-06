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
