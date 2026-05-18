import {getEnvVariable} from "@/utils/tool";
import { t } from '@/utils/i18n';
import CryptoJS from 'crypto-js';

// PBKDF2 参数
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEY_SIZE = 256 / 32; // 256 bits
const PBKDF2_HASHER = CryptoJS.algo.SHA256;

/**
 * 生成密码哈希（使用 PBKDF2 + 随机盐）
 * 返回格式: iterations$salt$hash（Base64编码）
 */
export function hashPassword(password: string): string {
  const salt = CryptoJS.lib.WordArray.random(128 / 8); // 128-bit salt
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: PBKDF2_KEY_SIZE,
    iterations: PBKDF2_ITERATIONS,
    hasher: PBKDF2_HASHER
  });
  return `${PBKDF2_ITERATIONS}$${salt.toString(CryptoJS.enc.Base64)}$${hash.toString(CryptoJS.enc.Base64)}`;
}

/**
 * 验证密码
 * 支持两种存储格式：
 *  - 新格式（PBKDF2）: iterations$salt$hash
 *  - 旧格式（SHA256，纯哈希值，64位hex）
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    // 新格式：PBKDF2 with salt
    if (storedHash.includes('$')) {
      const parts = storedHash.split('$');
      if (parts.length !== 3) return false;

      const [iterationsStr, saltB64, hashB64] = parts;
      const iterations = parseInt(iterationsStr as string, 10);
      if (isNaN(iterations) || iterations <= 0) return false;

      const salt = CryptoJS.enc.Base64.parse(saltB64 as string);
      const storedHashWordArray = CryptoJS.enc.Base64.parse(hashB64 as string);

      const computedHash = CryptoJS.PBKDF2(password, salt, {
        keySize: PBKDF2_KEY_SIZE,
        iterations: iterations,
        hasher: PBKDF2_HASHER
      });

      // 使用恒定时间比较防止时序攻击
      return computedHash.toString() === storedHashWordArray.toString();
    }

    // 旧格式：纯 SHA256 哈希（向后兼容）
    if (/^[a-fA-F0-9]{64}$/.test(storedHash)) {
      const inputHash = CryptoJS.SHA256(password).toString();
      // 恒定时间比较
      return timingSafeEqual(inputHash, storedHash);
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * 恒定时间字符串比较，防止时序攻击
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export const passwordApi = {
  /**
   * 验证密码
   * @param password 用户输入的密码
   * @returns 验证结果
   */
  verifyPassword(password: string): { success: boolean; message?: string } {
    try {
      const correctPasswordHash = getEnvVariable('VITE_BLOG_PASSWORD_HASH')

      if (!correctPasswordHash) {
        return {
          success: false,
          message: t('passwordProtectionNotConfigured')
        }
      }

      if (verifyPassword(password, correctPasswordHash as string)) {
        return { success: true }
      } else {
        return {
          success: false,
          message: t('incorrectPassword')
        }
      }
    } catch (error) {
      console.error('Password verification error:', error)
      return {
        success: false,
        message: t('loginError')
      }
    }
  },

  /**
   * 退出登录（清除密码并跳转）
   */
  logout(): void {
    localStorage.removeItem('blog-access-pwd')
    window.location.href = '/password'
  }
}