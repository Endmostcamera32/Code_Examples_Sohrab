export default function titleFromCode(code) {
  return code.trim().split("\n")[0].replace('// ', "")
}