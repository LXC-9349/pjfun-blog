import {pbkdf2Sync, randomBytes} from 'crypto';
import type {Plugin} from 'vite';

/**
 * 自动生成密码哈希的 Vite 插件
 * 从环境变量读取原始密码，生成 PBKDF2 哈希并注入到应用中
 * 支持开发模式和构建模式
 */
export function autoPasswordHashPlugin(): Plugin {
  return {
    name: 'auto-password-hash',

    config(config, { command }) {
      // 在开发模式和构建模式下都处理密码哈希
      const plainPassword = process.env.VITE_BLOG_PASSWORD;
      const storedHash = process.env.VITE_BLOG_PASSWORD_HASH;

      if (plainPassword) {
        // 如果提供了明文密码，则生成 PBKDF2 哈希（始终重新生成，使用随机盐）
        const salt = randomBytes(16);
        const keylen = 32; // 256 bits
        const iterations = 100000;

        const hash = pbkdf2Sync(plainPassword, salt, iterations, keylen, 'sha256');

        // 格式: iterations$salt_base64$hash_base64
        const pbkdf2Hash = `${iterations}$${salt.toString('base64')}$${hash.toString('base64')}`;

        process.env.VITE_BLOG_PASSWORD_HASH = pbkdf2Hash;

        // 安全提示：不输出哈希值本身
        console.log('[Auto Password Hash] Password hash generated successfully using PBKDF2.');
        console.log('[Auto Password Hash] Plain password from VITE_BLOG_PASSWORD was used.');
      } else if (!storedHash) {
        if (command === 'build') {
          console.warn(
            '[Auto Password Hash] Warning: Neither VITE_BLOG_PASSWORD nor VITE_BLOG_PASSWORD_HASH is set. Password protection will be disabled.'
          );
        }
      } else {
        // 验证已设置的 VITE_BLOG_PASSWORD_HASH 格式是否有效
        // 支持格式: (1) iterations$salt$hash (PBKDF2), (2) 64位hex (旧版SHA256)
        if (storedHash.includes('$')) {
          const parts = storedHash.split('$');
          if (parts.length !== 3) {
            console.warn(
              '[Auto Password Hash] Warning: VITE_BLOG_PASSWORD_HASH has invalid PBKDF2 format. ' +
              'Expected: iterations$salt_base64$hash_base64. Password protection may not work.'
            );
          }
        } else if (!/^[a-fA-F0-9]{64}$/.test(storedHash)) {
          console.warn(
            '[Auto Password Hash] Warning: VITE_BLOG_PASSWORD_HASH is not a valid hash format. ' +
            'Expected PBKDF2 format (iterations$salt$hash) or SHA256 hex (64 chars). ' +
            'Password protection may not work correctly.'
          );
        }
      }

      return config;
    }
  };
}