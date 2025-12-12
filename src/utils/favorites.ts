/**
 * 收藏管理工具
 */

// 收藏项类型定义
export interface FavoriteItem {
  path: string;
  title: string;
  date: string;
  cover?: string;
  tags?: string[];
  excerpt?: string;
}

const FAVORITES_KEY = 'pjfun_blog_favorites';

/**
 * 获取所有收藏的文章
 */
export function getFavorites(): FavoriteItem[] {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Failed to parse favorites from localStorage:', error);
    return [];
  }
}

/**
 * 添加文章到收藏
 * @param item 要收藏的文章信息
 */
export function addFavorite(item: FavoriteItem): void {
  try {
    const favorites = getFavorites();
    // 检查是否已经收藏
    const exists = favorites.some(fav => fav.path === item.path);
    if (!exists) {
      favorites.push(item);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Failed to add favorite:', error);
  }
}

/**
 * 从收藏中移除文章
 * @param path 文章路径
 */
export function removeFavorite(path: string): void {
  try {
    let favorites = getFavorites();
    favorites = favorites.filter(fav => fav.path !== path);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to remove favorite:', error);
  }
}

/**
 * 检查文章是否已被收藏
 * @param path 文章路径
 */
export function isFavorite(path: string): boolean {
  try {
    const favorites = getFavorites();
    return favorites.some(fav => fav.path === path);
  } catch (error) {
    console.error('Failed to check favorite status:', error);
    return false;
  }
}