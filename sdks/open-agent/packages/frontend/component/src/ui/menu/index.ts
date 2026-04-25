export * from './menu.types';
import { ContextMenu } from './desktop/context-menu';
import { DesktopMenuItem } from './desktop/item';
import { DesktopMenu } from './desktop/root';
import { DesktopMenuSeparator } from './desktop/separator';
import { DesktopMenuSub } from './desktop/sub';
import { MenuTrigger } from './menu-trigger';

const MenuItem = DesktopMenuItem;
const MenuSeparator = DesktopMenuSeparator;
const MenuSub = DesktopMenuSub;
const Menu = DesktopMenu;

export {
  ContextMenu,
  DesktopMenu,
  DesktopMenuItem,
  DesktopMenuSeparator,
  DesktopMenuSub,
};

export { Menu, MenuItem, MenuSeparator, MenuSub, MenuTrigger };
