// src/models/menu.ts

// [1] 定義所有的 Collection 名稱 (這裡新增 'blog')
export type CollectionType = 'notes' | 'series' | 'languages' | 'blog';

export type MenuItem = MenuPage | MenuGroup;

export type MenuPage = {
  type: 'page';
  title: string;
  href: string;
  date?: string | Date;
  sameDateSort?: number;
}

export type MenuGroup = {
  type: 'group';
  title: string;
  children: MenuItem[];
}

export type MenuCollectionConfig = {
  collectionName: CollectionType;
  title: string;
  baseUrl: string;
}

// [2] 設定檔
export const MENU_COLLECTIONS: MenuCollectionConfig[] = [
  { collectionName: 'blog', title: 'Blog', baseUrl: '/blog' },
  { collectionName: 'notes', title: 'Notes', baseUrl: '/notes' },
  { collectionName: 'series', title: 'Series', baseUrl: '/series' },
  { collectionName: 'languages', title: 'Languages', baseUrl: '/languages' },
]
