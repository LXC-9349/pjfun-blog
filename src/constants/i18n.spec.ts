import { describe, expect, it } from 'vitest'
import { I18N_CONFIG } from './i18n'

describe('i18n dictionaries', () => {
  it('中英文键集合保持一致', () => {
    const zh = Object.keys(I18N_CONFIG.zh).sort()
    const en = Object.keys(I18N_CONFIG.en).sort()
    expect(en).toEqual(zh)
  })
})
