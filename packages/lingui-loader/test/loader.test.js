import compiler from './compiler.js'

describe('lingui-loader', function () {
  let cwd

  beforeAll(function () {
    cwd = process.cwd()
    process.chdir(__dirname)
  })

  afterAll(function () {
    process.chdir(cwd)
  })

  it('should compile catalog', async () => {
    const stats = await compiler('./locale/en/messages.json')
    const output = stats.toJson().modules[0].source
    expect(output).toMatchSnapshot()
  })
})
