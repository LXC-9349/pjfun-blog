import { describe, expect, it } from 'vitest'
import CryptoJS from 'crypto-js'
import { hashPassword, verifyPassword } from './password'

describe('password utils', () => {
  it('PBKDF2 哈希可以正确验证密码', () => {
    const stored = hashPassword('correct horse battery staple')
    expect(stored.split('$')).toHaveLength(3)
    expect(verifyPassword('correct horse battery staple', stored)).toBe(true)
    expect(verifyPassword('wrong password', stored)).toBe(false)
  }, 20_000)

  it('兼容旧版无盐 SHA256 哈希', () => {
    const legacy = CryptoJS.SHA256('legacy-pass').toString()
    expect(verifyPassword('legacy-pass', legacy)).toBe(true)
    expect(verifyPassword('other', legacy)).toBe(false)
  })

  it('拒绝格式非法的存储值', () => {
    expect(verifyPassword('x', 'not-a-hash')).toBe(false)
    expect(verifyPassword('x', '100000$bad$hash$extra')).toBe(false)
    expect(verifyPassword('x', '0$c2FsdA==$aGFzaA==')).toBe(false)
  })
})
