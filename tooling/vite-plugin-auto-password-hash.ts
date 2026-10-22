import {pbkdf2Sync, randomBytes} from 'crypto';
import path from 'node:path';
import {loadEnv, type Plugin} from 'vite';

const ITERATIONS = 100_000;
const KEY_LENGTH = 32;

function createHash(password: string): string {
  // 每次构建使用随机盐；产物中只保留哈希
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
  return `${ITERATIONS}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

function warnInvalidHash(storedHash: string) {
  if (storedHash.includes('$')) {
    const parts = storedHash.split('$');
    if (parts.length !== 3) {
      console.warn(
        '[Auto Password Hash] Warning: VITE_BLOG_PASSWORD_HASH has invalid PBKDF2 format. ' +
        'Expected: iterations$salt_base64$hash_base64. Password protection may not work.'
      );
    }
    return;
  }
  if (!/^[a-fA-F0-9]{64}$/.test(storedHash)) {
    console.warn(
      '[Auto Password Hash] Warning: VITE_BLOG_PASSWORD_HASH is not a valid hash format. ' +
      'Expected PBKDF2 format (iterations$salt$hash) or SHA256 hex (64 chars). ' +
      'Password protection may not work correctly.'
    );
  }
}

/**
 * 自动生成密码哈希的 Vite 插件
 *
 * 明文密码使用非 VITE_ 前缀的 BLOG_PASSWORD（也兼容旧的 VITE_BLOG_PASSWORD），
 * 在 config 阶段读取 .env / 进程环境，生成 PBKDF2 哈希后只把哈希注入客户端。
 * 明文变量会从客户端 env 中移除，避免被 import.meta.env 打包进产物。
 */
export function autoPasswordHashPlugin(): Plugin {
  return {
    name: 'auto-password-hash',
    enforce: 'pre',

    config(config, {mode}) {
      const root = path.resolve(config.root || process.cwd());
      const envDir = config.envDir ? path.resolve(root, config.envDir) : root;
      // config 钩子早于 Vite 的 loadEnv，必须自己读取一次 .env
      const fileEnv = loadEnv(mode, envDir, '');
      const plainPassword = fileEnv.BLOG_PASSWORD || fileEnv.VITE_BLOG_PASSWORD || '';
      const storedHash = fileEnv.VITE_BLOG_PASSWORD_HASH || process.env.VITE_BLOG_PASSWORD_HASH || '';

      if (plainPassword) {
        process.env.VITE_BLOG_PASSWORD_HASH = createHash(plainPassword);
        if (!fileEnv.BLOG_PASSWORD && fileEnv.VITE_BLOG_PASSWORD) {
          console.warn(
            '[Auto Password Hash] VITE_BLOG_PASSWORD 已弃用，请改用 BLOG_PASSWORD；' +
            '明文变量不会进入客户端产物。'
          );
        }
        console.log('[Auto Password Hash] Password hash generated successfully using PBKDF2.');
      } else if (!storedHash) {
        if (process.env.NODE_ENV === 'production') {
          console.warn(
            '[Auto Password Hash] Warning: Neither BLOG_PASSWORD nor VITE_BLOG_PASSWORD_HASH is set. ' +
            'Password protection will be disabled.'
          );
        }
      } else {
        warnInvalidHash(storedHash);
      }

      return config;
    },

    configResolved(config) {
      // 注意：不能把明文交给客户端 env（import.meta.env 会被整体序列化进 bundle）
      delete config.env.BLOG_PASSWORD;
      delete config.env.VITE_BLOG_PASSWORD;
    }
  };
}
