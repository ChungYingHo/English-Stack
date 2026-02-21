import { defineCollection, z } from 'astro:content'

// 定義共用的 Schema
const commonSchema = z.object({
  title: z.string().optional().default('Untitled'),
  draft: z.boolean().optional().default(false),
  author: z.string().optional().default('Jeremy'),
  // 支援 Date 物件或字串 (Astro 會自動解析)
  date: z.date().or(z.string()).optional(),
  tags: z.array(z.string()).optional().default([]),
  changelog: z.array(z.date().or(z.string())).optional().default([]),
  sameDateSort: z.number().optional().default(0),
})

// 定義各個 Collection
const notesCollection = defineCollection({
  type: 'content',
  schema: commonSchema,
})

const seriesCollection = defineCollection({
  type: 'content',
  schema: commonSchema,
})

const languagesCollection = defineCollection({
  type: 'content',
  schema: commonSchema,
})

const blogCollection = defineCollection({
  type: 'content',
  schema: commonSchema,
})

// 匯出 Collections
export const collections = {
  'notes': notesCollection,
  'series': seriesCollection,
  'languages': languagesCollection,
  'blog': blogCollection,
}
