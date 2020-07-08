import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SHARED_UTILS_MODULES } from './shared-util.module';
import { SHARED_ZORRO_MODULES } from './shared-zorro.module';

@NgModule({
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, ...SHARED_UTILS_MODULES, ...SHARED_ZORRO_MODULES],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ...SHARED_UTILS_MODULES, ...SHARED_ZORRO_MODULES],
})
export class SharedModule {}
