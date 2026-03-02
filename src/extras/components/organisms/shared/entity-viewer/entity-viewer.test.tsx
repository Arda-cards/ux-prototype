import { render, screen, waitFor, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

import type { AtomProps } from '@/lib/data-types/atom-types';
import type {
  DesignConfig,
  MountConfig,
  FieldDescriptor,
  ValidationResult,
  UpdateResult,
  TabConfig,
  ViewerError,
} from './types';
import { validateTab } from './tab-validator';
import { useEntityViewer } from './use-entity-viewer';
import { createArdaEntityViewer } from './create-entity-viewer';

// ============================================================================
// Test Entity & Helpers
// ============================================================================

interface TestEntity {
  name: string;
  email: string;
  age: number;
}

const mockEntity: TestEntity = {
  name: 'Test Name',
  email: 'test@example.com',
  age: 30,
};

const emptyEntity: TestEntity = { name: '', email: '', age: 0 };

/** Minimal atom component for testing. */
function MockAtom({ value, onChange, mode, errors, label, editable }: AtomProps<string>) {
  if (mode === 'display' || editable === false) {
    return <span data-testid={`display-${label}`}>{String(value ?? '')}</span>;
  }
  return (
    <div>
      <input
        data-testid={`input-${label}`}
        value={String(value ?? '')}
        onChange={(e) => onChange(String(value ?? ''), e.target.value)}
      />
      {mode === 'error' &&
        errors?.map((err, i) => (
          <span key={i} data-testid={`error-${label}`} className="text-red-600">
            {err}
          </span>
        ))}
    </div>
  );
}

const noErrors: ValidationResult = { fieldErrors: [], entityErrors: [] };

function createMockDesignConfig(
  overrides?: Partial<DesignConfig<TestEntity>>,
): DesignConfig<TestEntity> {
  return {
    validate: () => noErrors,
    get: vi.fn().mockResolvedValue({ ...mockEntity }),
    update: vi.fn().mockResolvedValue({ entity: { ...mockEntity } } as UpdateResult<TestEntity>),
    newInstance: () => ({ ...emptyEntity }),
    ...overrides,
  };
}

function createMockMountConfig(
  overrides?: Partial<MountConfig<TestEntity>>,
): MountConfig<TestEntity> {
  return {
    title: 'Test Viewer',
    layoutMode: 'continuous-scroll',
    editable: true,
    entityId: '123',
    ...overrides,
  };
}

const mockFieldDescriptors: Partial<Record<keyof TestEntity, FieldDescriptor<unknown>>> = {
  name: {
    component: MockAtom as React.ComponentType<AtomProps<unknown>>,
    label: 'Name',
    editable: true,
    visible: true,
    validate: (v) => (v ? undefined : 'Name is required'),
  },
  email: {
    component: MockAtom as React.ComponentType<AtomProps<unknown>>,
    label: 'Email',
    editable: true,
    visible: true,
    validate: (v) => (v ? undefined : 'Email is required'),
  },
  age: {
    component: MockAtom as React.ComponentType<AtomProps<unknown>>,
    label: 'Age',
    editable: true,
    visible: true,
  },
};

// ============================================================================
// 1. Tab Validator Tests
// ============================================================================

describe('validateTab', () => {
  const tabConfig: TabConfig = {
    name: 'basic',
    label: 'Basic Info',
    fieldKeys: ['name', 'email', 'age'],
    order: 0,
  };

  it('returns errors for invalid fields', () => {
    const entity: TestEntity = { name: '', email: '', age: 0 };
    const descriptors: Partial<Record<string, FieldDescriptor<unknown>>> = {
      name: {
        component: MockAtom as React.ComponentType<AtomProps<unknown>>,
        label: 'Name',
        editable: true,
        visible: true,
        validate: (v) => (v ? undefined : 'Name is required'),
      },
      email: {
        component: MockAtom as React.ComponentType<AtomProps<unknown>>,
        label: 'Email',
        editable: true,
        visible: true,
        validate: (v) => (v ? undefined : 'Email is required'),
      },
    };

    const errors = validateTab<TestEntity>(tabConfig, entity, descriptors);
    expect(errors).toHaveLength(2);
    expect(errors[0]).toEqual({ message: 'Name is required', fieldPath: 'name' });
    expect(errors[1]).toEqual({ message: 'Email is required', fieldPath: 'email' });
  });

  it('skips hidden and non-editable fields', () => {
    const entity: TestEntity = { name: '', email: '', age: 0 };
    const descriptors: Partial<Record<string, FieldDescriptor<unknown>>> = {
      name: {
        component: MockAtom as React.ComponentType<AtomProps<unknown>>,
        label: 'Name',
        editable: false,
        visible: true,
        validate: () => 'Should not run',
      },
      email: {
        component: MockAtom as React.ComponentType<AtomProps<unknown>>,
        label: 'Email',
        editable: true,
        visible: false,
        validate: () => 'Should not run',
      },
    };

    const errors = validateTab<TestEntity>(tabConfig, entity, descriptors);
    expect(errors).toHaveLength(0);
  });

  it('returns empty array when all fields are valid', () => {
    const entity: TestEntity = { name: 'Valid', email: 'valid@example.com', age: 25 };
    const descriptors: Partial<Record<string, FieldDescriptor<unknown>>> = {
      name: {
        component: MockAtom as React.ComponentType<AtomProps<unknown>>,
        label: 'Name',
        editable: true,
        visible: true,
        validate: (v) => (v ? undefined : 'Required'),
      },
    };

    const errors = validateTab<TestEntity>(tabConfig, entity, descriptors);
    expect(errors).toHaveLength(0);
  });

  it('handles missing field descriptors gracefully', () => {
    const entity: TestEntity = { name: 'Valid', email: '', age: 0 };
    // No descriptors for any of the tab's fieldKeys
    const errors = validateTab<TestEntity>(tabConfig, entity, {});
    expect(errors).toHaveLength(0);
  });
});

// ============================================================================
// 2. useEntityViewer Hook Tests
// ============================================================================

describe('useEntityViewer', () => {
  describe('Edit flow', () => {
    it('initializes in display mode after get() resolves', async () => {
      const designConfig = createMockDesignConfig();
      const mountConfig = createMockMountConfig();

      const { result } = renderHook(() =>
        useEntityViewer(designConfig, mountConfig, mockFieldDescriptors),
      );

      await waitFor(() => {
        expect(result.current.state.mode).toBe('display');
        expect(result.current.state.original).toEqual(mockEntity);
      });
    });

    it('enterEditMode creates working copy and transitions to edit', async () => {
      const designConfig = createMockDesignConfig();
      const mountConfig = createMockMountConfig();

      const { result } = renderHook(() =>
        useEntityViewer(designConfig, mountConfig, mockFieldDescriptors),
      );

      await waitFor(() => expect(result.current.state.mode).toBe('display'));

      act(() => {
        result.current.actions.enterEditMode();
      });

      expect(result.current.state.mode).toBe('edit');
      expect(result.current.state.current).toEqual(mockEntity);
    });

    it('cancelEdit reverts to display with original data', async () => {
      const designConfig = createMockDesignConfig();
      const mountConfig = createMockMountConfig();

      const { result } = renderHook(() =>
        useEntityViewer(designConfig, mountConfig, mockFieldDescriptors),
      );

      await waitFor(() => expect(result.current.state.mode).toBe('display'));

      act(() => result.current.actions.enterEditMode());
      act(() => result.current.actions.handleFieldChange('name', 'Changed'));
      act(() => result.current.actions.cancelEdit());

      expect(result.current.state.mode).toBe('display');
      expect(result.current.state.isDirty).toBe(false);
      expect(result.current.state.current).toBeNull();
    });

    it('handleFieldChange updates current and sets isDirty', async () => {
      const designConfig = createMockDesignConfig();
      const mountConfig = createMockMountConfig();

      const { result } = renderHook(() =>
        useEntityViewer(designConfig, mountConfig, mockFieldDescriptors),
      );

      await waitFor(() => expect(result.current.state.mode).toBe('display'));

      act(() => result.current.actions.enterEditMode());
      act(() => result.current.actions.handleFieldChange('name', 'New Name'));

      expect(result.current.state.current?.name).toBe('New Name');
      expect(result.current.state.isDirty).toBe(true);
    });

    it('validateAndSubmit with valid data updates and re-fetches', async () => {
      const updatedEntity = { ...mockEntity, name: 'Updated' };
      const designConfig = createMockDesignConfig({
        update: vi.fn().mockResolvedValue({ entity: updatedEntity }),
        get: vi.fn().mockResolvedValue(updatedEntity),
      });
      const mountConfig = createMockMountConfig();

      const { result } = renderHook(() => useEntityViewer(designConfig, mountConfig));

      await waitFor(() => expect(result.current.state.mode).toBe('display'));

      act(() => result.current.actions.enterEditMode());
      act(() => result.current.actions.handleFieldChange('name', 'Updated'));

      await act(async () => {
        await result.current.actions.validateAndSubmit();
      });

      expect(designConfig.update).toHaveBeenCalled();
      expect(designConfig.get).toHaveBeenCalledTimes(2); // initial + re-fetch
      expect(result.current.state.mode).toBe('display');
      expect(result.current.state.isDirty).toBe(false);
    });

    it('validateAndSubmit with field validation errors transitions to errored', async () => {
      const designConfig = createMockDesignConfig();
      const mountConfig = createMockMountConfig();

      // Field descriptors that will fail validation on empty name
      const descriptors: Partial<Record<keyof TestEntity, FieldDescriptor<unknown>>> = {
        name: {
          component: MockAtom as React.ComponentType<AtomProps<unknown>>,
          label: 'Name',
          editable: true,
          visible: true,
          validate: (v) => (v ? undefined : 'Name is required'),
        },
      };

      const { result } = renderHook(() => useEntityViewer(designConfig, mountConfig, descriptors));

      await waitFor(() => expect(result.current.state.mode).toBe('display'));

      act(() => result.current.actions.enterEditMode());
      act(() => result.current.actions.handleFieldChange('name', ''));

      await act(async () => {
        await result.current.actions.validateAndSubmit();
      });

      await waitFor(() => expect(result.current.state.mode).toBe('errored'));
      expect(result.current.state.fieldErrors).toHaveLength(1);
      expect(result.current.state.fieldErrors[0]!.message).toBe('Name is required');
      expect(designConfig.update).not.toHaveBeenCalled();
    });

    it('validateAndSubmit with entity-level errors transitions to errored', async () => {
      const designConfig = createMockDesignConfig({
        validate: () => ({
          fieldErrors: [],
          entityErrors: [{ message: 'Entity is invalid' }],
        }),
      });
      const mountConfig = createMockMountConfig();

      const { result } = renderHook(() => useEntityViewer(designConfig, mountConfig));

      await waitFor(() => expect(result.current.state.mode).toBe('display'));

      act(() => result.current.actions.enterEditMode());

      await act(async () => {
        await result.current.actions.validateAndSubmit();
      });

      await waitFor(() => expect(result.current.state.mode).toBe('errored'));
      expect(result.current.state.entityErrors).toHaveLength(1);
      expect(result.current.state.entityErrors[0]!.message).toBe('Entity is invalid');
    });

    it('validateAndSubmit with update errors transitions to errored', async () => {
      const designConfig = createMockDesignConfig({
        update: vi.fn().mockResolvedValue({
          entity: mockEntity,
          errors: [{ message: 'Server error', fieldPath: 'name' }, { message: 'General failure' }],
        }),
      });
      const mountConfig = createMockMountConfig();

      const { result } = renderHook(() => useEntityViewer(designConfig, mountConfig));

      await waitFor(() => expect(result.current.state.mode).toBe('display'));

      act(() => result.current.actions.enterEditMode());

      await act(async () => {
        await result.current.actions.validateAndSubmit();
      });

      await waitFor(() => expect(result.current.state.mode).toBe('errored'));
      expect(result.current.state.fieldErrors).toHaveLength(1);
      expect(result.current.state.fieldErrors[0]!.fieldPath).toBe('name');
      expect(result.current.state.entityErrors).toHaveLength(1);
      expect(result.current.state.entityErrors[0]!.message).toBe('General failure');
    });

    it('dismissErrors clears errors and returns to edit', async () => {
      const designConfig = createMockDesignConfig({
        validate: () => ({
          fieldErrors: [{ message: 'Bad', fieldPath: 'name' }],
          entityErrors: [],
        }),
      });
      const mountConfig = createMockMountConfig();

      const { result } = renderHook(() => useEntityViewer(designConfig, mountConfig));

      await waitFor(() => expect(result.current.state.mode).toBe('display'));

      act(() => result.current.actions.enterEditMode());

      await act(async () => {
        await result.current.actions.validateAndSubmit();
      });

      await waitFor(() => expect(result.current.state.mode).toBe('errored'));

      act(() => result.current.actions.dismissErrors());

      expect(result.current.state.mode).toBe('edit');
      expect(result.current.state.fieldErrors).toHaveLength(0);
      expect(result.current.state.entityErrors).toHaveLength(0);
    });
  });

  describe('Create flow', () => {
    it('initializes in edit mode with newInstance data', async () => {
      const designConfig = createMockDesignConfig();
      const { entityId: _, ...base } = createMockMountConfig();
      const mountConfig: MountConfig<TestEntity> = base;

      const { result } = renderHook(() => useEntityViewer(designConfig, mountConfig));

      await waitFor(() => {
        expect(result.current.state.mode).toBe('edit');
        expect(result.current.state.current).toEqual(emptyEntity);
      });
    });

    it('validateAndSubmit success calls onExitWithSuccess', async () => {
      const onExitWithSuccess = vi.fn();
      const savedEntity = { name: 'New', email: 'new@test.com', age: 1 };
      const designConfig = createMockDesignConfig({
        update: vi.fn().mockResolvedValue({ entity: savedEntity }),
        onExitWithSuccess,
      });
      const { entityId: _, ...base2 } = createMockMountConfig();
      const mountConfig: MountConfig<TestEntity> = base2;

      const { result } = renderHook(() => useEntityViewer(designConfig, mountConfig));

      await waitFor(() => expect(result.current.state.mode).toBe('edit'));

      act(() => result.current.actions.handleFieldChange('name', 'New'));

      await act(async () => {
        await result.current.actions.validateAndSubmit();
      });

      expect(onExitWithSuccess).toHaveBeenCalledWith(savedEntity);
      expect(result.current.state.mode).toBe('display');
    });

    it('cancelEdit returns to display mode', async () => {
      const designConfig = createMockDesignConfig();
      const { entityId: _, ...base3 } = createMockMountConfig();
      const mountConfig: MountConfig<TestEntity> = base3;

      const { result } = renderHook(() => useEntityViewer(designConfig, mountConfig));

      await waitFor(() => expect(result.current.state.mode).toBe('edit'));

      act(() => result.current.actions.cancelEdit());

      expect(result.current.state.mode).toBe('display');
      expect(result.current.state.isDirty).toBe(false);
    });
  });

  describe('Dirty tracking', () => {
    it('isDirty is false initially', async () => {
      const designConfig = createMockDesignConfig();
      const mountConfig = createMockMountConfig();

      const { result } = renderHook(() => useEntityViewer(designConfig, mountConfig));

      await waitFor(() => expect(result.current.state.mode).toBe('display'));

      expect(result.current.state.isDirty).toBe(false);
    });

    it('isDirty is true after handleFieldChange', async () => {
      const designConfig = createMockDesignConfig();
      const mountConfig = createMockMountConfig();

      const { result } = renderHook(() => useEntityViewer(designConfig, mountConfig));

      await waitFor(() => expect(result.current.state.mode).toBe('display'));

      act(() => result.current.actions.enterEditMode());
      act(() => result.current.actions.handleFieldChange('name', 'Changed'));

      expect(result.current.state.isDirty).toBe(true);
    });

    it('isDirty is false after successful save', async () => {
      const designConfig = createMockDesignConfig();
      const mountConfig = createMockMountConfig();

      const { result } = renderHook(() => useEntityViewer(designConfig, mountConfig));

      await waitFor(() => expect(result.current.state.mode).toBe('display'));

      act(() => result.current.actions.enterEditMode());
      act(() => result.current.actions.handleFieldChange('name', 'Changed'));

      expect(result.current.state.isDirty).toBe(true);

      await act(async () => {
        await result.current.actions.validateAndSubmit();
      });

      expect(result.current.state.isDirty).toBe(false);
    });

    it('isDirty is false after cancelEdit', async () => {
      const designConfig = createMockDesignConfig();
      const mountConfig = createMockMountConfig();

      const { result } = renderHook(() => useEntityViewer(designConfig, mountConfig));

      await waitFor(() => expect(result.current.state.mode).toBe('display'));

      act(() => result.current.actions.enterEditMode());
      act(() => result.current.actions.handleFieldChange('name', 'Changed'));

      expect(result.current.state.isDirty).toBe(true);

      act(() => result.current.actions.cancelEdit());

      expect(result.current.state.isDirty).toBe(false);
    });
  });

  describe('Tab navigation', () => {
    const tabs: TabConfig[] = [
      { name: 'tab1', label: 'Tab 1', fieldKeys: ['name'], order: 0 },
      { name: 'tab2', label: 'Tab 2', fieldKeys: ['email'], order: 1 },
    ];

    it('navigateToTab succeeds when validation passes', async () => {
      const designConfig = createMockDesignConfig();
      const mountConfig = createMockMountConfig({
        layoutMode: 'stepped',
        tabs,
      });
      const descriptors: Partial<Record<keyof TestEntity, FieldDescriptor<unknown>>> = {
        name: {
          component: MockAtom as React.ComponentType<AtomProps<unknown>>,
          label: 'Name',
          editable: true,
          visible: true,
          validate: (v) => (v ? undefined : 'Required'),
        },
      };

      const { result } = renderHook(() => useEntityViewer(designConfig, mountConfig, descriptors));

      await waitFor(() => expect(result.current.state.mode).toBe('display'));

      act(() => result.current.actions.enterEditMode());

      let success = false;
      await act(async () => {
        success = await result.current.actions.navigateToTab(1);
      });

      expect(success).toBe(true);
      expect(result.current.state.currentTabIndex).toBe(1);
    });

    it('navigateToTab fails when validation has errors', async () => {
      const designConfig = createMockDesignConfig();
      const mountConfig = createMockMountConfig({
        layoutMode: 'stepped',
        tabs,
      });
      const descriptors: Partial<Record<keyof TestEntity, FieldDescriptor<unknown>>> = {
        name: {
          component: MockAtom as React.ComponentType<AtomProps<unknown>>,
          label: 'Name',
          editable: true,
          visible: true,
          validate: (v) => (v ? undefined : 'Required'),
        },
      };

      const { result } = renderHook(() => useEntityViewer(designConfig, mountConfig, descriptors));

      await waitFor(() => expect(result.current.state.mode).toBe('display'));

      act(() => result.current.actions.enterEditMode());
      // Set name to empty so validation fails
      act(() => result.current.actions.handleFieldChange('name', ''));

      let success = true;
      await act(async () => {
        success = await result.current.actions.navigateToTab(1);
      });

      expect(success).toBe(false);
      expect(result.current.state.currentTabIndex).toBe(0);
      expect(result.current.state.fieldErrors.length).toBeGreaterThan(0);
    });

    it('navigateToTab updates currentTabIndex in display mode', async () => {
      const designConfig = createMockDesignConfig();
      const mountConfig = createMockMountConfig({
        layoutMode: 'stepped',
        tabs,
      });

      const { result } = renderHook(() => useEntityViewer(designConfig, mountConfig));

      await waitFor(() => expect(result.current.state.mode).toBe('display'));

      let success = false;
      await act(async () => {
        success = await result.current.actions.navigateToTab(1);
      });

      expect(success).toBe(true);
      expect(result.current.state.currentTabIndex).toBe(1);
    });
  });
});

// ============================================================================
// 3. Factory Tests
// ============================================================================

describe('createArdaEntityViewer', () => {
  it('returns a component that renders without errors', async () => {
    const designConfig = createMockDesignConfig();
    const { Component } = createArdaEntityViewer<TestEntity>(designConfig, mockFieldDescriptors);

    render(<Component title="Test" layoutMode="continuous-scroll" editable entityId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  it('component shows title', async () => {
    const designConfig = createMockDesignConfig();
    const { Component } = createArdaEntityViewer<TestEntity>(designConfig);

    render(
      <Component
        title="My Entity"
        layoutMode="continuous-scroll"
        editable={false}
        entityId="123"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('My Entity')).toBeInTheDocument();
    });
  });

  it('component in display mode shows entity data via field descriptors', async () => {
    const designConfig = createMockDesignConfig();
    const { Component } = createArdaEntityViewer<TestEntity>(designConfig, mockFieldDescriptors);

    render(
      <Component title="Display Test" layoutMode="continuous-scroll" editable entityId="123" />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('display-Name')).toHaveTextContent('Test Name');
    });
  });

  it('edit button triggers edit mode', async () => {
    const user = userEvent.setup();
    const designConfig = createMockDesignConfig();
    const { Component } = createArdaEntityViewer<TestEntity>(designConfig, mockFieldDescriptors);

    render(<Component title="Edit Test" layoutMode="continuous-scroll" editable entityId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(screen.getByTestId('input-Name')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// 4. Mount-Time Validation Tests
// ============================================================================

describe('mount-time validation', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('missing title logs console.error', async () => {
    const designConfig = createMockDesignConfig();
    const { Component } = createArdaEntityViewer<TestEntity>(designConfig);

    render(<Component title="" layoutMode="continuous-scroll" editable={false} entityId="123" />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('title'));
    });
  });

  it('stepped layout without tabs logs console.error', async () => {
    const designConfig = createMockDesignConfig();
    const { Component } = createArdaEntityViewer<TestEntity>(designConfig);

    render(<Component title="Test" layoutMode="stepped" editable={false} entityId="123" />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('tabs'));
    });
  });

  it('valid config does not log console errors', async () => {
    const designConfig = createMockDesignConfig();
    const { Component } = createArdaEntityViewer<TestEntity>(designConfig);

    render(
      <Component title="Valid" layoutMode="continuous-scroll" editable={false} entityId="123" />,
    );

    await waitFor(() => {
      expect(screen.getByText('Valid')).toBeInTheDocument();
    });

    // Should not have mount-time errors (design config errors may fire but not mount ones)
    const mountErrors = consoleErrorSpy.mock.calls.filter(
      (call: unknown[]) => typeof call[0] === 'string' && call[0].includes('MountConfig'),
    );
    expect(mountErrors).toHaveLength(0);
  });
});

// ============================================================================
// 5. Server-Side Error Tests
// ============================================================================

describe('server-side errors', () => {
  it('UpdateResult with field errors shows errors in errored state', async () => {
    const fieldError: ViewerError = { message: 'Name taken', fieldPath: 'name' };
    const designConfig = createMockDesignConfig({
      update: vi.fn().mockResolvedValue({
        entity: mockEntity,
        errors: [fieldError],
      }),
    });
    const mountConfig = createMockMountConfig();

    const { result } = renderHook(() => useEntityViewer(designConfig, mountConfig));

    await waitFor(() => expect(result.current.state.mode).toBe('display'));

    act(() => result.current.actions.enterEditMode());

    await act(async () => {
      await result.current.actions.validateAndSubmit();
    });

    await waitFor(() => expect(result.current.state.mode).toBe('errored'));
    expect(result.current.state.fieldErrors).toEqual([fieldError]);
    expect(result.current.state.entityErrors).toHaveLength(0);
  });

  it('UpdateResult with entity errors shows errors in errored state', async () => {
    const entityError: ViewerError = { message: 'Duplicate entity' };
    const designConfig = createMockDesignConfig({
      update: vi.fn().mockResolvedValue({
        entity: mockEntity,
        errors: [entityError],
      }),
    });
    const mountConfig = createMockMountConfig();

    const { result } = renderHook(() => useEntityViewer(designConfig, mountConfig));

    await waitFor(() => expect(result.current.state.mode).toBe('display'));

    act(() => result.current.actions.enterEditMode());

    await act(async () => {
      await result.current.actions.validateAndSubmit();
    });

    await waitFor(() => expect(result.current.state.mode).toBe('errored'));
    expect(result.current.state.entityErrors).toEqual([entityError]);
    expect(result.current.state.fieldErrors).toHaveLength(0);
  });

  it('onExitWithErrors is called when update returns errors', async () => {
    const onExitWithErrors = vi.fn();
    const designConfig = createMockDesignConfig({
      update: vi.fn().mockResolvedValue({
        entity: mockEntity,
        errors: [{ message: 'Server error' }],
      }),
      onExitWithErrors,
    });
    const mountConfig = createMockMountConfig();

    const { result } = renderHook(() => useEntityViewer(designConfig, mountConfig));

    await waitFor(() => expect(result.current.state.mode).toBe('display'));

    act(() => result.current.actions.enterEditMode());

    await act(async () => {
      await result.current.actions.validateAndSubmit();
    });

    expect(onExitWithErrors).toHaveBeenCalledWith([{ message: 'Server error' }]);
  });
});
