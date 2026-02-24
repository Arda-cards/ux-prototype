'use client';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { SupplierTypeahead } from './SupplierTypeahead';
import type { ICellEditorParams } from 'ag-grid-community';

export class SupplierCellEditor {
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
    this.eGui.className = 'ag-cell-edit-supplier';
    // Let AG Grid handle the styling - don't override padding/margin
    // AG Grid will apply its own styles including the orange border when editing
    this.eGui.style.display = 'flex';
    this.eGui.style.alignItems = 'center';
    this.eGui.style.height = '100%';
    this.eGui.style.width = '100%';

    const value = (params.value as string) ?? '';
    
    const handleChange = (v: string) => {
      // Always update committed value immediately
      this.committedValue = v;
      
      // Don't automatically stop editing when selecting from dropdown
      // Let AG Grid handle stopping editing naturally (on blur, Tab, Enter, etc.)
      // This prevents issues with draft creation and value saving
      // The value will be committed when the user leaves the cell normally
    };

    // Handle ESC key to cancel editing
    this.keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.wasCancelled = true;
        this.committedValue = this.initialValue;
        this.params?.stopEditing(true); // true = cancel
      }
    };
    this.eGui.addEventListener('keydown', this.keyDownHandler);

    this.root = createRoot(this.eGui);
    this.root.render(
      <SupplierTypeahead
        value={value}
        onChange={handleChange}
        placeholder="Search suppliers..."
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
    // Cancel if ESC was pressed
    return this.wasCancelled;
  }

  focusIn() {
    // Focus the input inside SupplierTypeahead
    const input = this.eGui?.querySelector('input');
    if (input) {
      setTimeout(() => {
        input.focus();
      }, 0);
    }
  }

  focusOut() {
    // When focus leaves, commit the current value if not cancelled
    // AG Grid will call getValue() after this, so we update committedValue here
    // This ensures the value is saved when user clicks away or tabs to another cell
    if (!this.wasCancelled) {
      const input = this.eGui?.querySelector('input') as HTMLInputElement;
      if (input) {
        const currentValue = input.value.trim();
        // Always update committedValue with current input value
        this.committedValue = currentValue;
      }
    }
  }

  afterGuiAttached() {
    // Focus the input when editor is attached and select all text
    // This allows immediate typing for bulk editing
    const input = this.eGui?.querySelector('input') as HTMLInputElement;
    if (input) {
      setTimeout(() => {
        input.focus();
        // Select all text so user can immediately start typing to replace
        input.select();
      }, 0);
    }
  }

  destroy() {
    // Remove event listeners
    if (this.eGui && this.keyDownHandler) {
      this.eGui.removeEventListener('keydown', this.keyDownHandler);
      this.keyDownHandler = null;
    }

    // Use setTimeout to avoid unmounting during React render
    // AG Grid may call destroy() during render, which causes React errors
    if (this.root) {
      const rootToUnmount = this.root;
      setTimeout(() => {
        try {
          rootToUnmount.unmount();
        } catch (error) {
          // Ignore errors if already unmounted or element removed
          console.debug('[SupplierCellEditor] Error during unmount:', error);
        }
      }, 0);
    }
    this.root = null;
    this.eGui = null;
    this.params = null;
    this.wasCancelled = false;
  }
}
