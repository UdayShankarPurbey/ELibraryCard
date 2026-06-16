import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Directive({ selector: '[appHasPermission]' })
export class HasPermission {
  private readonly tpl = inject(TemplateRef<unknown>);
  private readonly vcr = inject(ViewContainerRef);
  private readonly auth = inject(AuthService);

  readonly appHasPermission = input.required<string | string[]>();
  readonly appHasPermissionMode = input<'all' | 'any'>('all');

  private visible = false;

  constructor() {
    effect(() => {
      const keys = this.appHasPermission();
      const required = Array.isArray(keys) ? keys : [keys];
      const allowed =
        this.appHasPermissionMode() === 'any'
          ? this.auth.hasAny(...required)
          : this.auth.has(required);

      if (allowed && !this.visible) {
        this.vcr.createEmbeddedView(this.tpl);
        this.visible = true;
      } else if (!allowed && this.visible) {
        this.vcr.clear();
        this.visible = false;
      }
    });
  }
}
