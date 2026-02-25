'use client';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { SublocationTypeahead } from './SublocationTypeahead';
import type { ICellEditorParams } from 'ag-grid-community';

export class SublocationCellEditor {
  private eGui: HTMLDivElement | null = null;
  private params: ICellEditorParams | null = null;
  private committedValue: string = '';
  private initialValue: string = '';
  private root: ReturnType<typeof createRoot> | null = null;
  private wasCancelled: boolean = false;
  private keyDownHandler: ((e: KeyboardEvent) => void) | null = null;

  init(params: ICellEditorParams) {
    this.params = params;
    const initialVal = (params.value as string) ?? '';
    this.initialValue = initialVal;
    this.committedValue = initialVal;
    this.wasCancelled = false;

    this.eGui = document.createElement('div');
    this.eGui.className = 'ag-cell-edit-sublocation';
    this.eGui.style.display = 'flex';
    this.eGui.style.alignItems = 'center';
    this.eGui.style.height = '100%';
    this.eGui.style.width = '100%';

    const value = (params.value as string) ?? '';

    const handleChange = (v: string) => {
      this.committedValue = v;
    };

    this.keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.wasCancelled = true;
        this.committedValue = this.initialValue;
        this.params?.stopEditing(true);
      }
    };
    this.eGui.addEventListener('keydown', this.keyDownHandler);

    this.root = createRoot(this.eGui);
    this.root.render(
      <SublocationTypeahead
        value={value}
        onChange={handleChange}
        placeholder="Search for sub-location"
        cellEditorMode={true}
      />
    );
  }

  getGui() {
    return this.eGui ?? document.createElement('div');
  }

  getValue(): string {
    const input = this.eGui?.querySelector('input') as HTMLInputElement;
    if (input) {
      this.committedValue = input.value.trim();
    }
    return this.committedValue;
  }

  isCancelBeforeStart() {
    return false;
  }

  isCancelAfterEnd() {
    return this.wasCancelled;
  }

  focusIn() {
    const input = this.eGui?.querySelector('input');
    if (input) {
      setTimeout(() => {
        input.focus();
      }, 0);
    }
  }

  focusOut() {
    if (!this.wasCancelled) {
      const input = this.eGui?.querySelector('input') as HTMLInputElement;
      if (input) {
        const currentValue = input.value.trim();
        this.committedValue = currentValue;
      }
    }
  }

  afterGuiAttached() {
    const input = this.eGui?.querySelector('input');
    if (input) {
      setTimeout(() => {
        input.focus();
        input.select();
      }, 0);
    }
  }

  destroy() {
    if (this.eGui && this.keyDownHandler) {
      this.eGui.removeEventListener('keydown', this.keyDownHandler);
      this.keyDownHandler = null;
    }

    if (this.root) {
      const rootToUnmount = this.root;
      setTimeout(() => {
        try {
          rootToUnmount.unmount();
        } catch {
          // unmount may fail if already unmounted
        }
      }, 0);
    }
    this.root = null;
    this.eGui = null;
    this.params = null;
    this.wasCancelled = false;
  }
}
