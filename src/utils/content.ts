import { getCollection } from 'astro:content'
import type { CollectionType } from '@/models/menu' 

export async function generateCollectionPaths(collectionName: CollectionType) {
  // [修正]
  // 1. collectionName as any: 繞過集合名稱檢查
  // 2. (entry: any): 參數直接設為 any，避免 unknown 解構錯誤
  const entries = await getCollection(collectionName as any, (entry: any) => {
    return entry.data.draft !== true
  })

  return entries.map((entry: any) => ({
    params: { slug: entry.slug },
    props: { entry },
  }))
}
