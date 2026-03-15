import { getCollection } from 'astro:content'

export interface VocabOccurrence {
  articleTitle: string;
  articleLink: string;
  pos: string;
  meaning: string;
  example: string;
}

export interface VocabItem {
  word: string;
  phonetic: string;
  frequency: number;
  occurrences: VocabOccurrence[];
}

export async function useVocabulary(category: 'common' | 'toefl'): Promise<VocabItem[]> {
  // 使用 as any 繞過 Astro 嚴格的集合名稱檢查
  const readingEntries = await getCollection('reading' as any, (entry: any) => {
    return entry.slug.startsWith(`${category}/`) && entry.data?.draft !== true
  })
  const listeningEntries = await getCollection('listening' as any, (entry: any) => {
    return entry.slug.startsWith(`${category}/`) && entry.data?.draft !== true
  })
  const entries = [
    ...readingEntries.map((e: any) => ({ ...e, _collection: 'reading' })),
    ...listeningEntries.map((e: any) => ({ ...e, _collection: 'listening' })),
  ]

  const vocabMap = new Map<string, VocabItem>()

  entries.forEach((entry: any) => {
    const body = entry.body
    if (!body) return

    const articleTitle = entry.data?.title || 'Untitled'
    const articleLink = `/${entry._collection}/${entry.slug}`

    const rows = body.split('\n').filter((line: string) => line.trim().startsWith('|'))
    
    rows.forEach((row: string) => {
      if (row.includes('---')) return
      if (row.includes('單字') && row.includes('音標')) return

      const cols = row.split('|').map((c: string) => c.trim())
      
      if (cols.length >= 6) {
        const word = cols[1]
        const phonetic = cols[2]
        const pos = cols[3]
        const meaning = cols[4]
        const example = cols[5]

        if (!word) return

        const key = word.toLowerCase()
        const occurrence: VocabOccurrence = {
          articleTitle,
          articleLink,
          pos,
          meaning,
          example
        }
        
        if (vocabMap.has(key)) {
          const existing = vocabMap.get(key)!
          existing.frequency += 1
          existing.occurrences.push(occurrence)
        } else {
          vocabMap.set(key, { 
            word, 
            phonetic, 
            frequency: 1, 
            occurrences: [occurrence] 
          })
        }
      }
    })
  })

  return Array.from(vocabMap.values()).sort((a, b) => {
    if (b.frequency !== a.frequency) {
      return b.frequency - a.frequency
    }
    return a.word.localeCompare(b.word)
  })
}
