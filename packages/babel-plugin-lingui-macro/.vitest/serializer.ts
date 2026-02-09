// override a default serializer and omit `"` symbol around code parts
export default {
  test: (val) => typeof val === "string",
  print: (val) => val,
}
