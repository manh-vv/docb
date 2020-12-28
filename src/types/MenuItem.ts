export interface MenuItem {
  id: string;
  text: string;
  type: 'branch' | 'file' | 'hash';
  order: number;

  /**
   * Git url: with this URL we can get the file content
   */
  url?: string;

  /**
   * menu href: we can contruct menu link with this value
   */
  href?: string;

  parentId?: string;
  childIds?: string[];

  level: number;

  /**
   * If it is active
   * then all its children need to be showed
   */
  active: boolean;
}
