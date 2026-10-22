// 粒子特效运行参数（外观设置之外的可调项）
export const PETAL_EFFECT_CONFIG = {
  /** 鼠标避让半径（px） */
  mouseRadius: 110,
  /** 场景内发光粒子数量上限 */
  maxSpecialPetals: 48,
  /** 每次点击生成的粒子数 */
  clickSpawnCount: 3,
  /** SVG 图标相对粒子尺寸的缩放 */
  iconScale: 1.35,
  /** 画布最大像素比 */
  maxDpr: 2,
  /** 底部不生成粒子的安全区高度（px） */
  clickBottomSafeArea: 80
} as const
