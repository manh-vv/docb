import { MenuItem } from './MenuItem';

export default function createLeaf(id: string, text: string): MenuItem {
  return {
    id,
    text,
    active: false,
    order: 0,
    level: 0,
    type: 'file',
  };
}
