export type CollectionType = 'reading' | 'writing' | 'listening' | 'grammar';

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

export const MENU_COLLECTIONS: MenuCollectionConfig[] = [
  { collectionName: 'reading', title: 'Reading', baseUrl: '/reading' },
  { collectionName: 'writing', title: 'Writing', baseUrl: '/writing' },
  { collectionName: 'listening', title: 'Listening', baseUrl: '/listening' },
  { collectionName: 'grammar', title: 'Grammar', baseUrl: '/grammar' },
]
