import { Component, computed, input } from '@angular/core';
import {
  LucideAngularModule,
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Users,
  BookOpen,
  ArrowLeftRight,
  Bookmark,
  Menu,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  KeyRound,
  SlidersHorizontal,
  Settings,
} from 'lucide-angular';

const ICONS = {
  dashboard: LayoutDashboard,
  building: Building2,
  shield: ShieldCheck,
  users: Users,
  book: BookOpen,
  swap: ArrowLeftRight,
  bookmark: Bookmark,
  menu: Menu,
  logout: LogOut,
  sun: Sun,
  moon: Moon,
  'chevron-down': ChevronDown,
  plus: Plus,
  edit: Pencil,
  trash: Trash2,
  key: KeyRound,
  fields: SlidersHorizontal,
  settings: Settings,
} as const;

@Component({
  selector: 'app-icon',
  imports: [LucideAngularModule],
  template: `<lucide-angular [img]="icon()" [size]="size()" class="inline-block" />`,
})
export class Icon {
  readonly name = input.required<string>();
  readonly size = input(20);

  protected readonly icon = computed(
    () => ICONS[this.name() as keyof typeof ICONS] ?? LayoutDashboard,
  );
}
