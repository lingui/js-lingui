import generate from "babel-generator"
import { compile } from "./compile"

describe("compile", function() {
  const getSource = message =>
    generate(compile(message), {
      compact: true,
      minified: true
    }).code

  it("should optimize string only messages", function() {
    expect(getSource("Hello World")).toEqual('"Hello World"')
  })

  it("should compile arguments", function() {
    expect(getSource("{name}")).toEqual('function(a){return[a("name")]}')

    expect(getSource("B4 {name} A4")).toEqual(
      'function(a){return["B4 ",a("name")," A4"]}'
    )
  })

  it("should compile arguments with formats", function() {
    expect(getSource("{name, number}")).toEqual(
      'function(a){return[a("name","number")]}'
    )

    expect(getSource("{name, number, percent}")).toEqual(
      'function(a){return[a("name","number","percent")]}'
    )
  })

  it("should compile plural", function() {
    expect(getSource("{name, plural, one {Book} other {Books}}")).toEqual(
      'function(a){return[a("name","plural",{one:"Book",other:"Books"})]}'
    )

    expect(
      getSource("{name, plural, one {Book} other {{name} Books}}")
    ).toEqual(
      'function(a){return[a("name","plural",{one:"Book",other:[a("name")," Books"]})]}'
    )

    expect(getSource("{name, plural, one {Book} other {# Books}}")).toEqual(
      'function(a){return[a("name","plural",{one:"Book",other:["#"," Books"]})]}'
    )

    expect(
      getSource(
        "{name, plural, offset:1 =0 {No Books} one {Book} other {# Books}}"
      )
    ).toEqual(
      'function(a){return[a("name","plural",{offset:1,0:"No Books",one:"Book",other:["#"," Books"]})]}'
    )
  })

  it("should compile select", function() {
    expect(getSource("{name, select, male {He} female {She}}")).toEqual(
      'function(a){return[a("name","select",{male:"He",female:"She"})]}'
    )

    expect(getSource("{name, select, male {He} female {{name} She}}")).toEqual(
      'function(a){return[a("name","select",{male:"He",female:[a("name")," She"]})]}'
    )

    expect(getSource("{name, select, male {He} female {# She}}")).toEqual(
      'function(a){return[a("name","select",{male:"He",female:"# She"})]}'
    )
  })
})
