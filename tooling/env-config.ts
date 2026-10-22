import { access, copyFile, readFile, rename, writeFile } from 'fs/promises'
import path from 'path'
import { STUDIO_SETTING_KEYS } from '../src/constants/studio-settings'

// 站点参数读写：只操作 .env，保留原有注释与其他变量
const ENV_FILE = '.env'
const ENV_EXAMPLE = '.env.example'

export interface EnvConfigSnapshot {
  values: Record<string, string>
  /** .env.example 中的默认值，用于「仅导出修改项」 */
  defaults: Record<string, string>
  /** .env 是否已存在；不存在时展示 .env.example 的值 */
  exists: boolean
  path: string
}

async function exists(target: string): Promise<boolean> {
  try {
    await access(target)
    return true
  } catch {
    return false
  }
}

function parseEnv(raw: string): Map<string, string> {
  const values = new Map<string, string>()
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!match) continue
    let value = match[2].trim()
    // 去掉成对引号，保留原值内容
    if (value.length >= 2) {
      const first = value[0]
      const last = value[value.length - 1]
      if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
        value = value.slice(1, -1)
      }
    }
    values.set(match[1], value)
  }
  return values
}

async function readRaw(root: string, filename: string): Promise<string> {
  try {
    return await readFile(path.join(root, filename), 'utf-8')
  } catch {
    return ''
  }
}

export async function readEnvConfig(root: string): Promise<EnvConfigSnapshot> {
  const envExists = await exists(path.join(root, ENV_FILE))
  const raw = envExists ? await readRaw(root, ENV_FILE) : await readRaw(root, ENV_EXAMPLE)
  const parsed = parseEnv(raw)
  const defaultParsed = parseEnv(await readRaw(root, ENV_EXAMPLE))

  const values: Record<string, string> = {}
  const defaults: Record<string, string> = {}
  for (const key of STUDIO_SETTING_KEYS) {
    values[key] = parsed.get(key) ?? ''
    defaults[key] = defaultParsed.get(key) ?? ''
  }

  return { values, defaults, exists: envExists, path: ENV_FILE }
}

/** 只更新白名单内的键；注释、顺序与其他变量保持不变 */
export async function writeEnvConfig(
  root: string,
  updates: Record<string, string>
): Promise<EnvConfigSnapshot> {
  const envPath = path.join(root, ENV_FILE)
  if (!(await exists(envPath))) {
    const examplePath = path.join(root, ENV_EXAMPLE)
    if (await exists(examplePath)) {
      await copyFile(examplePath, envPath)
    } else {
      await writeFile(envPath, '', 'utf-8')
    }
  }

  const pending = new Map<string, string>()
  for (const [key, value] of Object.entries(updates)) {
    if (!STUDIO_SETTING_KEYS.has(key)) continue
    // 环境变量值不允许换行
    pending.set(key, String(value ?? '').replace(/[\r\n]+/g, ' '))
  }

  const lines = (await readRaw(root, ENV_FILE)).split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/)
    if (!match) continue
    const key = match[1]
    if (!pending.has(key)) continue
    lines[i] = `${key}=${pending.get(key)}`
    pending.delete(key)
  }

  if (pending.size) {
    if (lines.length && lines[lines.length - 1].trim() !== '') lines.push('')
    lines.push('# 以下参数由创作台「站点参数」保存')
    for (const [key, value] of pending) lines.push(`${key}=${value}`)
  }

  const content = `${lines.join('\n').replace(/\n+$/, '')}\n`
  const suffix = `${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`
  const tmp = `${envPath}.${suffix}.tmp`
  await writeFile(tmp, content, 'utf-8')
  await rename(tmp, envPath)

  return readEnvConfig(root)
}
