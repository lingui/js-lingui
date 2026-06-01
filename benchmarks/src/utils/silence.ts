export function silenceConsole() {
  const origLog = console.log
  const origError = console.error
  const origInfo = console.info
  const origStdoutWrite = process.stdout.write
  const origStderrWrite = process.stderr.write
  console.log = () => {}
  console.error = () => {}
  console.info = () => {}
  process.stdout.write = () => true
  process.stderr.write = () => true
  return () => {
    console.log = origLog
    console.error = origError
    console.info = origInfo
    process.stdout.write = origStdoutWrite
    process.stderr.write = origStderrWrite
  }
}
