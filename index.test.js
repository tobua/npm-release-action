import path from 'path'
import { execSync } from 'child_process'
import { wait } from './wait.js'

test('throws invalid number', async () => {
  await expect(wait('foo')).rejects.toThrow('milliseconds not a number')
})

test('wait 500 ms', async () => {
  const start = new Date()
  await wait(500)
  const end = new Date()
  var delta = Math.abs(end - start)
  expect(delta).toBeGreaterThanOrEqual(500)
})

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_MILLISECONDS'] = 500
  const ip = path.join(__dirname, 'dist/index.js')
  console.log(execSync(`node ${ip}`, { env: process.env }).toString())
})
