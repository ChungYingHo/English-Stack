import type { MenuItem, MenuGroup } from '@/models/menu'
import { MENU_COLLECTIONS, type CollectionType } from '@/models/menu'
import { getCollection } from 'astro:content'

// 移除日期前綴
function removeDatePrefix(fileSegment: string): string {
  return fileSegment.replace(/^\d{8}-/, '')
}

// 轉為可讀標題
function humanizeSegment(pathSegment: string): string {
  const segmentWithoutDate = removeDatePrefix(pathSegment)
  const withSpaces = segmentWithoutDate.replace(/[-_]/g, ' ')
  return withSpaces.replace(/\b\w/g, (c) => c.toUpperCase())
}

// 決定 Collection Entry 的標題 (使用 any 繞過 never 錯誤)
function resolveEntryTitle(entry: any): string {
  const data = entry.data
  if (data?.title) return data.title
  
  const slugParts = entry.slug.split('/')
  const fileName = slugParts[slugParts.length - 1]
  return humanizeSegment(fileName)
}

// 遞迴查找或建立 Group
function getOrCreateGroup(
  currentLevelItems: MenuItem[],
  groupTitle: string
): MenuGroup {
  const existingGroup = currentLevelItems.find(
    (item) => item.type === 'group' && item.title === groupTitle
  ) as MenuGroup | undefined

  if (existingGroup) {
    return existingGroup
  }

  const newGroup: MenuGroup = {
    type: 'group',
    title: groupTitle,
    children: [],
  }
  
  currentLevelItems.push(newGroup)
  return newGroup
}

// 將 Entry 插入樹狀結構 (明確宣告 segment, index 型別)
function insertEntryIntoTree(
  menuTree: MenuItem[],
  entry: any, 
  baseUrl: string
): void {
  const pathSegments = entry.slug.split('/')
  let currentLevelItems = menuTree
  const href = `${baseUrl}/${entry.slug}`

  pathSegments.forEach((segment: string, index: number) => {
    const isLast = index === pathSegments.length - 1

    if (isLast) {
      currentLevelItems.push({
        type: 'page',
        title: resolveEntryTitle(entry),
        href: href,
        date: entry.data?.date,
        sameDateSort: entry.data?.sameDateSort,
      } as any)
    } else {
      const groupTitle = humanizeSegment(segment)
      
      const group = getOrCreateGroup(currentLevelItems, groupTitle)
      currentLevelItems = group.children
    }
  })
}

// 遞迴排序：Page 優先，其次 Group，最後依字母
function sortMenuTree(menuItems: MenuItem[]): void {
  menuItems.sort((a, b) => {
    if (a.type === 'page' && b.type === 'page') {
      const pageA = a as any
      const pageB = b as any
      
      if (pageA.date && pageB.date) {
        const timeA = new Date(pageA.date).getTime()
        const timeB = new Date(pageB.date).getTime()
        if (timeA !== timeB) {
          return timeB - timeA 
        }
      }
      
      const sortA = pageA.sameDateSort ?? 0
      const sortB = pageB.sameDateSort ?? 0
      
      if (sortA !== sortB) {
        return sortA - sortB
      }
      
      return a.title.localeCompare(b.title)
    }

    if (a.type !== b.type) {
      return a.type === 'page' ? -1 : 1
    }

    return a.title.localeCompare(b.title)
  })

  for (const item of menuItems) {
    if (item.type === 'group') {
      sortMenuTree(item.children)
    }
  }
}

// 建構 Collection 樹狀選單 (使用 as any 繞過嚴格集合檢查)
async function buildTreeFromCollection(
  name: CollectionType,
  baseUrl: string
) {
  const tree: MenuItem[] = []
  
  const entries = await getCollection(name as any, (entry: any) => {
    return entry.data?.draft !== true
  })

  for (const entry of entries) {
    insertEntryIntoTree(tree, entry, baseUrl)
  }

  sortMenuTree(tree)

  return tree
}

// 定義靜態頁面
function getStaticPages(): MenuItem[] {
  return [
    { 
      type: 'group', 
      title: 'Vocabulary', 
      children: [
        { type: 'page', title: 'Common Vocabulary', href: '/vocabularies-common' },
        { type: 'page', title: 'Toefl Vocabulary', href: '/vocabularies-toefl' },
      ]
    },
    {
      type: 'page',
      title: 'Listening Practice',
      href: '/listening'
    }
  ]
}

// Public API: 整合 Static Pages 與 Collections
export async function useMenu() {
  const staticPages = getStaticPages()

  const collectionMenusPromises = MENU_COLLECTIONS.map(async (config) => {
    const tree = await buildTreeFromCollection(config.collectionName, config.baseUrl)

    return {
      type: 'group' as const,
      title: config.title,
      children: tree
    }
  })

  const collectionMenus = await Promise.all(collectionMenusPromises)

  const validCollectionMenus = collectionMenus.filter(item => {
    return item.children && item.children.length > 0
  })

  const fullMenu = [...staticPages, ...validCollectionMenus]

  return { menu: fullMenu }
}
