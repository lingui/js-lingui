// override a default serializer and omit `"` symbol around code parts
module.exports = {
  test: (val) => typeof val === "string",
  print: (val) => val,
}
