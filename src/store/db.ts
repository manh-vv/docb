import Dexie from 'dexie';
import { MenuItem } from 'types/MenuItem';

class MenuItemDatabase extends Dexie {
  public menuItems: Dexie.Table<MenuItem, string>;

  constructor() {
    super('menu-items-postfix');
    this.version(1).stores({
      menuItems: 'id,type,level,active,parentId,childItems',
    });
    this.menuItems = this.table('menuItems');
  }
}

const db = new MenuItemDatabase();

export default db;
