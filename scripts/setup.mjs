import { spawn, spawnSync } from 'node:child_process'
import { access, copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 一键环境搭建：检查 Node / pnpm → 安装依赖 → 生成 .env → 准备草稿目录
// 入口脚本：Windows 双击 start.bat，Linux / macOS 执行 bash start.sh
// 用法：
//   pnpm bootstrap        仅搭建环境
//   pnpm start            搭建环境并启动 dev server
//   node scripts/setup.mjs --check        只检查环境
//   node scripts/setup.mjs --pm pnpm      指定 pnpm 命令
//   node scripts/setup.mjs --skip-install 跳过依赖安装

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// 参数解析：支持 --pm <命令>，便于 start.bat / start.sh 传入自己定位到的 pnpm
const argv = process.argv.slice(2)
let startDev = false
let checkOnly = false
let skipInstall = false
let pmCommand = process.env.PJ_PM || ''
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i]
  if (arg === '--dev') startDev = true
  else if (arg === '--check') checkOnly = true
  else if (arg === '--skip-install') skipInstall = true
  else if (arg === '--pm') pmCommand = argv[++i] || pmCommand
}
const PNPM = pmCommand || (process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm')

const exists = async target => {
  try {
    await access(path.join(ROOT, target))
    return true
  } catch {
    return false
  }
}

const ok = message => console.log(`[ok]   ${message}`)
const skip = message => console.log(`[skip] ${message}`)
const warn = message => console.log(`[warn] ${message}`)

function runPnpm(pnpmArgs) {
  // 固定参数拼接为字符串交给 shell，避免 args + shell 的弃用警告
  return spawnSync(`${PNPM} ${pnpmArgs.join(' ')}`, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true
  })
}

async function main() {
  console.log('PJ Blog 环境搭建')
  console.log(`项目目录：${ROOT}`)

  // 1. Node 版本
  const [nodeMajor, nodeMinor] = process.versions.node.split('.').map(Number)
  if (nodeMajor < 20 || (nodeMajor === 20 && nodeMinor < 19)) {
    warn(`Node ${process.versions.node} 版本偏低，建议升级到 20.19+（当前 Vite 7 的最低要求）`)
  } else {
    ok(`Node v${process.versions.node}`)
  }

  // 2. pnpm
  const pnpmVersion = spawnSync(`${PNPM} --version`, {
    cwd: ROOT,
    encoding: 'utf8',
    shell: true
  })
  if (pnpmVersion.status !== 0) {
    console.error('[error] 未检测到 pnpm')
    console.error('        安装方式：npm install -g pnpm（或 corepack enable）')
    process.exit(1)
  }
  ok(`pnpm ${pnpmVersion.stdout.trim()}`)

  // 3. 依赖 / 配置文件状态
  const hasModules = await exists('node_modules')
  const hasEnv = await exists('.env')
  const hasExample = await exists('.env.example')

  if (checkOnly) {
    console.log('')
    console.log(hasModules ? '[ok]   依赖已安装' : '[todo] 未安装依赖，运行 pnpm bootstrap')
    console.log(hasEnv ? '[ok]   .env 已存在' : '[todo] 未创建 .env，运行 pnpm bootstrap 自动生成')
    console.log(hasExample ? '[ok]   存在 .env.example 模板' : '[warn] 缺少 .env.example')
    return
  }

  // 4. 安装依赖
  if (!hasModules && !skipInstall) {
    console.log('')
    console.log('[..]   安装依赖（pnpm install）')
    const install = runPnpm(['install'])
    if (install.status !== 0) process.exit(install.status ?? 1)
    ok('依赖安装完成')
  } else if (hasModules) {
    skip('依赖已安装（需要重新安装可删除 node_modules）')
  } else {
    skip('已跳过依赖安装（--skip-install）')
  }

  // 5. 生成本地环境变量
  if (!hasEnv && hasExample) {
    await copyFile(path.join(ROOT, '.env.example'), path.join(ROOT, '.env'))
    ok('已根据 .env.example 创建 .env')
  } else if (hasEnv) {
    skip('.env 已存在，保留原有配置')
  } else {
    warn('未找到 .env.example，跳过 .env 创建')
  }

  // 6. 草稿目录
  await mkdir(path.join(ROOT, 'public', 'content', '_drafts'), { recursive: true })
  ok('草稿目录已就绪：public/content/_drafts')

  console.log('')
  console.log('环境已准备完成。')
  console.log('  一键启动：Windows 双击 start.bat；Linux / macOS 执行 bash start.sh')
  console.log('  写作入口：pnpm dev 后访问 http://localhost:1022/studio')
  console.log('  创作台参数：http://localhost:1022/studio → 站点参数')
  console.log('  内容检查：pnpm content:check')

  if (startDev) {
    console.log('')
    console.log('[..]   启动开发服务器…')
    const child = spawn(`${PNPM} dev`, {
      cwd: ROOT,
      stdio: 'inherit',
      shell: true
    })
    child.on('exit', code => process.exit(code ?? 0))
  } else {
    console.log('')
    console.log('启动开发环境：pnpm start（下次可一键完成）或 pnpm dev')
  }
}

main().catch(error => {
  console.error('[error] 环境搭建失败：', error)
  process.exit(1)
})
