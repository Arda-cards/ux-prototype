import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import type {
  BusinessRole,
  BusinessRoleType,
} from '@/extras/types/reference/business-affiliates/business-affiliate';
import type { FieldDescriptor } from '@/extras/components/organisms/shared/entity-viewer';
import { ArdaCustomFieldInteractive } from '@/extras/components/atoms/form/custom';

// ============================================================================
// Constants
// ============================================================================

const ROLE_DEFS: { role: BusinessRoleType; label: string }[] = [
  { role: 'VENDOR', label: 'Vendor' },
  { role: 'CUSTOMER', label: 'Customer' },
  { role: 'CARRIER', label: 'Carrier' },
  { role: 'OPERATOR', label: 'Operator' },
  { role: 'OTHER', label: 'Other' },
];

// ============================================================================
// Render Function
// ============================================================================

/**
 * Render function for the roles custom field.
 * Renders a checkbox group for BusinessRoleType values.
 */
export function renderRolesField(
  value: unknown,
  mode: AtomMode,
  onChange: (original: unknown, current: unknown) => void,
  errors?: string[],
): React.ReactNode {
  const roles = (value as BusinessRole[] | undefined) ?? [];
  const selectedRoles = new Set(roles.map((r) => r.role));

  if (mode === 'display') {
    if (roles.length === 0) {
      return <span className="text-sm text-muted-foreground">None</span>;
    }
    return (
      <span className="text-sm text-foreground">
        {roles.map((r) => ROLE_DEFS.find((d) => d.role === r.role)?.label ?? r.role).join(', ')}
      </span>
    );
  }

  const toggleRole = (roleType: BusinessRoleType) => {
    const exists = selectedRoles.has(roleType);
    const updated = exists
      ? roles.filter((r) => r.role !== roleType)
      : [...roles, { role: roleType }];
    // Sort for order-independent dirty tracking
    const sorted = [...updated].sort((a, b) => a.role.localeCompare(b.role));
    onChange(value, sorted);
  };

  return (
    <div>
      <fieldset>
        <legend className="block text-sm font-medium text-foreground mb-2">Business Roles</legend>
        <div className="flex flex-col gap-2">
          {ROLE_DEFS.map((def) => (
            <label key={def.role} className="flex items-center gap-1.5 text-sm text-foreground">
              <input
                type="checkbox"
                checked={selectedRoles.has(def.role)}
                onChange={() => toggleRole(def.role)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
              />
              {def.label}
            </label>
          ))}
        </div>
      </fieldset>
      {errors && errors.length > 0 && (
        <div className="mt-1">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-red-600">
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Field Descriptor
// ============================================================================

/** FieldDescriptor entry for the roles field, ready to plug into field descriptors. */
export const rolesFieldDescriptor: FieldDescriptor<unknown> = {
  component: ArdaCustomFieldInteractive as React.ComponentType<AtomProps<unknown>>,
  label: 'Roles',
  editable: true,
  visible: true,
  tabName: 'identity',
  validate: (value: unknown) => {
    const roles = value as BusinessRole[] | undefined;
    if (!roles || roles.length === 0) {
      return 'At least one business role is required.';
    }
    return undefined;
  },
};
