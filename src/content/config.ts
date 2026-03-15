import { defineCollection, z } from 'astro:content'

// 定義共用的 Schema
const commonSchema = z.object({
  title: z.string().optional().default('Untitled'),
  author: z.string().optional().default('Jeremy'),
  link: z.string().optional().default(''),
  date: z.date().or(z.string()).optional(),
  sameDateSort: z.number().optional().default(0),
})

const readingCollection = defineCollection({
  type: 'content',
  schema: commonSchema,
})

const writingCollection = defineCollection({
  type: 'content',
  schema: commonSchema,
})

const listeningCollection = defineCollection({
  type: 'content',
  schema: commonSchema,
})

const grammarCollection = defineCollection({
  type: 'content',
  schema: commonSchema,
})

export const collections = {
  'reading': readingCollection,
  'writing': writingCollection,
  'listening': listeningCollection,
  'grammar': grammarCollection,
}
