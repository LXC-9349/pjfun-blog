#!/usr/bin/env bash
# ============================================================
# PJ Blog 一键启动脚本（Linux / macOS）
#   用法：
#     bash start.sh            检查环境 -> 安装依赖 -> 生成 .env -> 启动开发服务器
#     bash start.sh check      只检查环境，不写任何文件
#     bash start.sh setup      只做环境搭建，不启动
#     bash start.sh build      环境搭建 + 生产构建
#   指定 Node 版本：PJ_NODE_VERSION=22.14.0 bash start.sh
#   首次使用可赋予执行权限：chmod +x start.sh
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

MODE="${1:-dev}"
NODE_VERSION="${PJ_NODE_VERSION:-22.14.0}"
TOOLS="$ROOT/.tools"

echo
echo " ============================================================"
echo "  PJ Blog 一键启动 / one-click launcher"
echo "  模式 / mode: $MODE"
echo " ============================================================"
echo

# ---------- 平台识别 ----------
# 可用 PJ_NODE_PLATFORM 强制指定（如 linux-x64 / darwin-arm64），便于离线测试或特殊发行版
if [ -n "${PJ_NODE_PLATFORM:-}" ]; then
  NODE_PLATFORM="$PJ_NODE_PLATFORM"
else
  OS_NAME="$(uname -s)"
  case "$OS_NAME" in
    Linux)  NODE_OS=linux ;;
    Darwin) NODE_OS=darwin ;;
    MINGW*|MSYS*|CYGWIN*)
      echo "[error] Windows 请双击 start.bat（本脚本面向 Linux / macOS）"
      exit 1
      ;;
    *)
      echo "[error] 暂不支持的系统：$OS_NAME"
      exit 1
      ;;
  esac

  ARCH="$(uname -m)"
  case "$ARCH" in
    x86_64|amd64)  NODE_ARCH=x64 ;;
    arm64|aarch64) NODE_ARCH=arm64 ;;
    armv7l)        NODE_ARCH=armv7l ;;
    *)
      echo "[error] 暂不支持的 CPU 架构：$ARCH"
      exit 1
      ;;
  esac

  NODE_PLATFORM="${NODE_OS}-${NODE_ARCH}"
fi

case "$NODE_PLATFORM" in
  darwin-*) NODE_EXT="tar.gz" ;;
  *)        NODE_EXT="tar.xz" ;;
esac

NODE_PKG="node-v${NODE_VERSION}-${NODE_PLATFORM}"
NODE_HOME="$TOOLS/$NODE_PKG"

# ---------- 1. Node.js ----------
echo "[1/3] 检查 Node.js / checking Node.js"
if ! command -v node >/dev/null 2>&1; then
  if [ ! -x "$NODE_HOME/bin/node" ]; then
    echo "      未检测到 Node.js，下载免安装版到 .tools 目录（无需 sudo）"
    mkdir -p "$TOOLS"
    FILE="$NODE_PKG.$NODE_EXT"
    DOWNLOADED=0
    for MIRROR in \
      "https://registry.npmmirror.com/-/binary/node/v$NODE_VERSION/$FILE" \
      "https://cdn.npmmirror.com/binaries/node/v$NODE_VERSION/$FILE" \
      "https://nodejs.org/dist/v$NODE_VERSION/$FILE"; do
      echo "      [..] 下载 / downloading: $MIRROR"
      if command -v curl >/dev/null 2>&1; then
        if curl -fL --retry 2 --connect-timeout 15 -o "$TOOLS/$FILE" "$MIRROR"; then DOWNLOADED=1; break; fi
      elif command -v wget >/dev/null 2>&1; then
        if wget -O "$TOOLS/$FILE" "$MIRROR"; then DOWNLOADED=1; break; fi
      else
        echo "      [error] 需要 curl 或 wget 用于下载，请先安装其中之一"
        exit 1
      fi
    done
    if [ "$DOWNLOADED" != "1" ]; then
      echo "      [error] 所有镜像下载失败，请检查网络或手动安装 Node.js v$NODE_VERSION"
      echo "             https://nodejs.org/zh-cn/download"
      exit 1
    fi
    echo "      [..] 解压 / extracting..."
    mkdir -p "$NODE_HOME"
    tar -xf "$TOOLS/$FILE" -C "$TOOLS"
    rm -f "$TOOLS/$FILE"
  fi
  export PATH="$NODE_HOME/bin:$PATH"
fi

if ! command -v node >/dev/null 2>&1; then
  echo "      [error] node 命令不可用"
  exit 1
fi
echo "      Node.js v$(node -p 'process.versions.node')"

# ---------- 2. pnpm ----------
echo "[2/3] 检查 pnpm / checking pnpm"
if ! command -v pnpm >/dev/null 2>&1; then
  echo "      未检测到 pnpm，尝试通过 corepack 启用"
  corepack enable pnpm >/dev/null 2>&1 || true
fi
if ! command -v pnpm >/dev/null 2>&1; then
  echo "      通过 npm 安装 pnpm"
  npm install -g pnpm
fi
if ! command -v pnpm >/dev/null 2>&1; then
  echo "      [error] pnpm 安装失败，请手动执行：npm install -g pnpm"
  exit 1
fi
echo "      pnpm v$(pnpm --version)"

# ---------- 3. 任务 ----------
echo "[3/3] 执行任务 / running task"
case "$MODE" in
  check)
    node "$ROOT/scripts/setup.mjs" --check
    ;;
  setup)
    node "$ROOT/scripts/setup.mjs" --pm pnpm
    ;;
  build)
    node "$ROOT/scripts/setup.mjs" --pm pnpm
    pnpm build
    ;;
  dev|"")
    node "$ROOT/scripts/setup.mjs" --dev --pm pnpm
    ;;
  *)
    echo "用法: bash start.sh [dev|setup|build|check]"
    exit 1
    ;;
esac

echo
echo " 完成 / done."
