// 阅读进度跟踪和最近浏览文章工具

export interface ReadingProgress {
  path: string;
  title: string;
  scrollTop: number;
  timestamp: number;
}

export interface RecentArticle {
  path: string;
  title: string;
  date: string;
  cover?: string;
  tags?: string[];
  excerpt?: string;
  lastVisited: number;
}

const READING_PROGRESS_KEY = 'pjfun_blog_reading_progress';
const RECENT_ARTICLES_KEY = 'pjfun_blog_recent_articles';

/**
 * 保存文章阅读进度
 * @param progress 阅读进度信息
 */
export function saveReadingProgress(progress: ReadingProgress): void {
  try {
    localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save reading progress:', e);
  }
}

/**
 * 获取文章阅读进度
 * @param path 文章路径
 * @returns 阅读进度信息，如果没有则返回null
 */
export function getReadingProgress(path: string): ReadingProgress | null {
  try {
    const progressStr = localStorage.getItem(READING_PROGRESS_KEY);
    if (!progressStr) return null;
    
    const progress: ReadingProgress = JSON.parse(progressStr);
    return progress.path === path ? progress : null;
  } catch (e) {
    console.error('Failed to get reading progress:', e);
    return null;
  }
}

/**
 * 清除阅读进度
 */
export function clearReadingProgress(): void {
  try {
    localStorage.removeItem(READING_PROGRESS_KEY);
  } catch (e) {
    console.error('Failed to clear reading progress:', e);
  }
}

/**
 * 添加最近浏览的文章
 * @param article 文章信息
 */
export function addRecentArticle(article: Omit<RecentArticle, 'lastVisited'>): void {
  try {
    const recentStr = localStorage.getItem(RECENT_ARTICLES_KEY);
    let recent: RecentArticle[] = recentStr ? JSON.parse(recentStr) : [];
    
    // 移除已存在的相同文章
    recent = recent.filter(item => item.path !== article.path);
    
    // 添加新文章到开头
    recent.unshift({
      ...article,
      lastVisited: Date.now()
    });
    
    // 只保留最近5篇文章
    if (recent.length > 5) {
      recent = recent.slice(0, 5);
    }
    
    localStorage.setItem(RECENT_ARTICLES_KEY, JSON.stringify(recent));
  } catch (e) {
    console.error('Failed to add recent article:', e);
  }
}

/**
 * 获取最近浏览的文章列表
 * @returns 最近浏览的文章数组
 */
export function getRecentArticles(): RecentArticle[] {
  try {
    const recentStr = localStorage.getItem(RECENT_ARTICLES_KEY);
    return recentStr ? JSON.parse(recentStr) : [];
  } catch (e) {
    console.error('Failed to get recent articles:', e);
    return [];
  }
}

/**
 * 清除最近浏览的文章记录
 */
export function clearRecentArticles(): void {
  try {
    localStorage.removeItem(RECENT_ARTICLES_KEY);
  } catch (e) {
    console.error('Failed to clear recent articles:', e);
  }
}