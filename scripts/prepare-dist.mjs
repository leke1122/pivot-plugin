import { cpSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

mkdirSync(path.join(dist, 'block'), { recursive: true })
cpSync(path.join(root, 'project.config.json'), path.join(dist, 'project.config.json'))
cpSync(path.join(root, 'block', 'index.json'), path.join(dist, 'block', 'index.json'))
console.log('Copied project.config.json and block/index.json into dist/')
