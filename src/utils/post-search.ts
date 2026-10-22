/** 文章搜索匹配：导航数据字段可能来自 YAML 的非字符串值（如数字标签） */
export interface SearchablePost {
  title?: unknown
  excerpt?: unknown
  tags?: unknown
}

export function matchesPostQuery(post: SearchablePost | null | undefined, rawQuery: unknown): boolean {
  const query = String(rawQuery ?? '').trim().toLowerCase()
  if (!query) return true
  if (!post) return false

  const title = String(post.title ?? '').toLowerCase()
  const excerpt = String(post.excerpt ?? '').toLowerCase()
  const tags = Array.isArray(post.tags)
    ? post.tags.map(tag => String(tag).toLowerCase())
    : []

  return title.includes(query)
    || excerpt.includes(query)
    || tags.some(tag => tag.includes(query))
}
