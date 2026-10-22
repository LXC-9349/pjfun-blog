// 粒子图标资源
import fengyeIcon from './fengye.svg'
import meihuaIcon from './meihua.svg'
import yinghua1Icon from './yinghua1.svg'
import yinxingIcon from './yinxing.svg'
import yumaoIcon from './yumao.svg'
import xingxingIcon from './xingxing.svg'
import type { ScreensaverPetalType } from '@/constants'

export const PETAL_ICON_URLS: Record<ScreensaverPetalType, string> = {
  yinxing: yinxingIcon,
  yinghua1: yinghua1Icon,
  fengye: fengyeIcon,
  meihua: meihuaIcon,
  yumao: yumaoIcon,
  xingxing: xingxingIcon
}
