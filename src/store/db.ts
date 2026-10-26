import Dexie, { Table } from 'dexie';
import { MenuItem } from 'types/MenuItem';

class MenuItemDatabase extends Dexie {
  public menuItems: Table<MenuItem, string>;

  constructor() {
    super('menu-items-postfix');
    this.version(1).stores({
      menuItems: 'id,type,level,active,parentId,childItems',
    });
    // ids became scoped by book in version 2: drop the unscoped items, which mixed books together
    this.version(2)
      .stores({
        menuItems: 'id,type,level,active,parentId,childItems',
      })
      .upgrade(tx => tx.table('menuItems').clear());
    this.menuItems = this.table('menuItems');
  }
}

const db = new MenuItemDatabase();

export default db;
