import { getCollection } from 'astro:content'

export interface VocabOccurrence {
  articleTitle: string;
  articleLink: string;
  pos: string;
  meaning: string;
  example?: string;
}

export interface VocabItem {
  word: string;
  phonetic: string;
  frequency: number;
  occurrences: VocabOccurrence[];
}

// 表頭關鍵字；若第一欄包含其中之一即視為標題列 (涵蓋「單字 / 片語」等變體)
const HEADER_LABELS = ['單字', '詞彙', 'word', 'vocabulary']

const isHeaderRow = (cells: string[]): boolean => {
  const first = cells[0].toLowerCase()
  return HEADER_LABELS.some((label) => first.includes(label))
}

// 判斷是否為 Markdown 表格分隔列，例如 |---|:--:|
const isSeparatorRow = (cells: string[]): boolean =>
  cells.length > 0 && cells.every((c) => /^:?-+:?$/.test(c))

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
      const cells = row.split('|').map((c: string) => c.trim())
      // 去除首尾外框 pipe 造成的空字串
      if (cells[0] === '') cells.shift()
      if (cells[cells.length - 1] === '') cells.pop()

      // 略過：欄位不足 (需 單字/音標/詞性/中文)、分隔列、表頭列
      if (cells.length < 4) return
      if (isSeparatorRow(cells)) return
      if (isHeaderRow(cells)) return

      const [word, phonetic, pos, meaning, exampleCell] = cells
      if (!word) return

      const example = exampleCell && exampleCell !== '-' ? exampleCell : undefined

      const key = word.toLowerCase()
      const occurrence: VocabOccurrence = {
        articleTitle,
        articleLink,
        pos,
        meaning,
        ...(example ? { example } : {}),
      }

      const existing = vocabMap.get(key)
      if (existing) {
        existing.frequency += 1
        existing.occurrences.push(occurrence)
      } else {
        vocabMap.set(key, { word, phonetic, frequency: 1, occurrences: [occurrence] })
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
