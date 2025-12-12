import {getEnvVariable} from "@/utils/tool";
import { t } from '@/utils/i18n';
import CryptoJS from 'crypto-js';

export const passwordApi = {
  /**
   * 验证密码
   * @param password 用户输入的密码
   * @returns 验证结果
   */
  verifyPassword(password: string): { success: boolean; message?: string } {
    try {
      // 获取环境变量中的密码哈希
      const correctPasswordHash = getEnvVariable('VITE_BLOG_PASSWORD_HASH')
      
      if (!correctPasswordHash) {
        return { 
          success: false, 
          message: t('passwordProtectionNotConfigured')
        }
      }

      // 计算输入密码的哈希值
      const inputHash = CryptoJS.SHA256(password).toString();
      
      // 比较哈希值
      if (inputHash === correctPasswordHash) {
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
  }
}