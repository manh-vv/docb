import { MenuItem } from './MenuItem';

export const ROOT_ID = '@introduction';

export default function createBranch(id: string, text: string = id): MenuItem {
  return {
    id,
    text,
    active: false,
    childIds: [],
    order: 0,
    level: 0,
    type: 'branch',
  };
}
