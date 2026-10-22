// 密码保护相关安全参数
export const PASSWORD_CONFIG = {
  /** PBKDF2 迭代次数 */
  pbkdf2Iterations: 100_000,
  /** 派生密钥长度（32 位字 = 256 bit） */
  keySizeWords: 256 / 32
} as const
