import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? files(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`]))).flat()
}
const output = await files('dist')
assert.ok(!output.some(file => /\/.env(?:\.|$)/.test(file)), 'No environment files in the production output')
assert.ok(!output.some(file => /(?:^|\/)(?:\.local-credentials|github\.env)(?:\/|$)/.test(file)), 'No GitHub credential files in the production output')
const client = (await Promise.all(output.filter(file => /\.(js|css|html|json)$/.test(file)).map(file => readFile(file, 'utf8')))).join('\n')
for (const marker of ['RESEND_API_KEY', 'NOTIFICATION_EMAIL', 'FROM_EMAIL', 'GH_TOKEN', 'GH_REPO', 'api.resend.com', 'NEXT_PUBLIC_']) assert.ok(!client.includes(marker), `No server-only marker in frontend: ${marker}`)
for (const name of ['RESEND_API_KEY', 'NOTIFICATION_EMAIL', 'FROM_EMAIL', 'GH_TOKEN']) {
  const value = process.env[name]
  if (value && value.length > 5) assert.ok(!client.includes(value), `No ${name} value in frontend`)
}
console.log('PASS: production frontend contains no email credentials, provider endpoint, or private configuration files.')
