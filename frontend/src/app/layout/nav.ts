import { AuthService } from '../core/auth/auth.service';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  superAdmin?: boolean;
  anyOf?: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', route: '/app', icon: 'dashboard' },
  { label: 'Institutions', route: '/app/institutions', icon: 'building', superAdmin: true },
  { label: 'Roles', route: '/app/roles', icon: 'shield', anyOf: ['role.manage'] },
  { label: 'Users', route: '/app/users', icon: 'users', anyOf: ['user.view', 'user.manage'] },
  { label: 'Catalog', route: '/app/catalog', icon: 'book', anyOf: ['book.view'] },
  {
    label: 'Circulation',
    route: '/app/circulation',
    icon: 'swap',
    anyOf: ['issue.view', 'issue.create', 'issue.return'],
  },
  { label: 'My books', route: '/app/my-issues', icon: 'bookmark' },
];

export function visibleNav(auth: AuthService): NavItem[] {
  const superAdmin = auth.isSuperAdmin();
  return NAV_ITEMS.filter((item) => {
    if (item.superAdmin) return superAdmin;
    if (item.route === '/app') return true;
    if (superAdmin) return false;
    return item.anyOf ? auth.hasAny(...item.anyOf) : true;
  });
}
