// 屏保配置：切换间隔与视频源（支持直链 MP4 与 Bilibili）
// 修改本文件即可调整屏保，无需改动组件

interface ScreensaverClipBase {
  id: string
  label: string
  labelEn: string
  /**
   * 视频未就绪时的占位图（相对 public 目录）
   * 不填则自动使用 public/bg 中的图片
   */
  poster?: string
}

export interface ScreensaverVideoClip extends ScreensaverClipBase {
  type: 'video'
  /** 直链视频地址，支持远程 URL 或 public 下的相对路径 */
  src: string
}

export interface ScreensaverBilibiliClip extends ScreensaverClipBase {
  type: 'bilibili'
  /** B 站视频 BV 号 */
  bvid: string
}

export type ScreensaverClip = ScreensaverVideoClip | ScreensaverBilibiliClip

export const SCREENSAVER_CONFIG: {
  /** 图片自动轮播间隔（秒）；视频循环播放，不按此间隔切换 */
  interval: number
  /** 启动时请求浏览器全屏（不支持时降级为沉浸覆盖层） */
  fullscreen: boolean
  /** 视频 / B 站加载超时（毫秒） */
  mediaLoadTimeout: number
  /** 控制条自动隐藏延时（毫秒） */
  controlsHideDelay: number
  /** 最小切换间隔（秒） */
  minInterval: number
  /** 随机切换最大重试次数（避免连续重复） */
  maxSwitchRetry: number
  /** 视频源：直链 MP4 与 Bilibili BV 号；默认播放视频，屏保内可切换为仅图片 */
  clips: ScreensaverClip[]
} = {
  interval: 8,
  fullscreen: true,
  mediaLoadTimeout: 15_000,
  controlsHideDelay: 3_000,
  minInterval: 3,
  maxSwitchRetry: 8,
  clips: [
    // Bilibili 视频：填入想要展示的 BV 号即可
    {
      id: 'bilibili-1',
      type: 'bilibili',
      label: 'B 站视频 01',
      labelEn: 'Bilibili 01',
      bvid: 'BV1qRqPYGEpq'
    },
    {
      id: 'bilibili-2',
      type: 'bilibili',
      label: 'B 站视频 02',
      labelEn: 'Bilibili 02',
      bvid: 'BV1XDmjYfEGz'
    },
    {
      id: 'bilibili-3',
      type: 'bilibili',
      label: 'B 站视频 03',
      labelEn: 'Bilibili 03',
      bvid: 'BV1qk4y1u7R8'
    },
    {
      id: 'ocean',
      type: 'video',
      label: '海浪',
      labelEn: 'Ocean',
      src: 'https://videos.pexels.com/video-files/1093662/1093662-hd_1280_720_30fps.mp4'
    },
    {
      id: 'nature',
      type: 'video',
      label: '自然',
      labelEn: 'Nature',
      src: 'https://videos.pexels.com/video-files/1526909/1526909-hd_1280_720_24fps.mp4'
    },
    {
      id: 'tech',
      type: 'video',
      label: '科技',
      labelEn: 'Tech',
      src: 'https://videos.pexels.com/video-files/3130284/3130284-hd_1280_720_30fps.mp4'
    },
    {
      id: 'city',
      type: 'video',
      label: '城市',
      labelEn: 'City',
      src: 'https://videos.pexels.com/video-files/3129671/3129671-hd_1280_720_30fps.mp4'
    }
    
  ]
}
