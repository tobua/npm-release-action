import { getInput, info, setFailed } from '@actions/core'
import { execSync } from 'child_process'
import { getRelease, createRelease } from './release.js'

// Top-level await not yet supported out of the box with default eslint-parser.
const run = async () => {
  try {
    const token = getInput('NPM_TOKEN')

    if (!token) {
      return setFailed('Missing NPM_TOKEN action secret.')
    }

    info(`release-npm-action with node: ${execSync('node -v').toString()}`)

    const { release, type } = getRelease()

    if (!release) {
      return info('No release requested.')
    }

    info(type)

    await createRelease()
  } catch (error) {
    setFailed(error.message)
  }

  return null
}

run()
