import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ITEM_IMAGE_CONFIG, MOCK_ITEM_IMAGE } from '@/components/canary/__mocks__/image-story-data';

import { ImageFormField } from './image-form-field';

const defaultProps = {
  config: ITEM_IMAGE_CONFIG,
  imageUrl: MOCK_ITEM_IMAGE,
  onChange: vi.fn(),
};

function renderField(
  overrides: {
    imageUrl?: string | null;
    onChange?: ReturnType<typeof vi.fn>;
    disabled?: boolean;
  } = {},
) {
  const onChange = overrides.onChange ?? vi.fn();
  const disabledProp = overrides.disabled !== undefined ? { disabled: overrides.disabled } : {};
  const result = render(
    <ImageFormField
      config={ITEM_IMAGE_CONFIG}
      imageUrl={overrides.imageUrl !== undefined ? overrides.imageUrl : MOCK_ITEM_IMAGE}
      onChange={onChange}
      {...disabledProp}
    />,
  );
  return { ...result, onChange };
}

describe('ImageFormField', () => {
  it('renders ImageDisplay with current image', () => {
    renderField();
    // ImageDisplay renders an img element when imageUrl is provided
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="image-display"]')).toBeInTheDocument();
  });

  it('renders initials placeholder when no image', () => {
    renderField({ imageUrl: null });
    // ImageDisplay shows initials for null imageUrl — "I" for "Item"
    expect(screen.getByText('I')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('shows action icons on hover (mouseenter → icons appear)', () => {
    renderField();
    const root = document.querySelector('[data-slot="image-form-field"]')!;

    // Hover state is driven by CSS group-hover — verify buttons exist in DOM
    // (visibility is CSS-only; we test DOM presence and aria labels)
    fireEvent.mouseEnter(root);

    expect(screen.getByRole('button', { name: 'Inspect image' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit image' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove image' })).toBeInTheDocument();
  });

  it('hides action icons when not hovered (icons in DOM but opacity-0 by default)', () => {
    renderField();
    // Icons are always rendered; visibility is CSS-driven via group-hover
    // We verify the overlay container has opacity-0 class (not group-hover:opacity-100 triggered)
    const overlay = document
      .querySelector('[data-slot="image-form-field"]')
      ?.querySelector('.opacity-0');
    expect(overlay).toBeInTheDocument();
  });

  it('eye icon suppressed when no image', () => {
    renderField({ imageUrl: null });
    expect(screen.queryByRole('button', { name: 'Inspect image' })).not.toBeInTheDocument();
  });

  it('trash icon hidden when no image', () => {
    renderField({ imageUrl: null });
    expect(screen.queryByRole('button', { name: 'Remove image' })).not.toBeInTheDocument();
  });

  it('pencil click fires edit action without error', async () => {
    const user = userEvent.setup();
    renderField();

    // Edit action is a TODO stub — verify button is clickable without throwing
    await user.click(screen.getByRole('button', { name: 'Edit image' }));
    expect(screen.getByRole('button', { name: 'Edit image' })).toBeInTheDocument();
  });

  it('trash click opens remove confirmation (AlertDialog content visible)', async () => {
    const user = userEvent.setup();
    renderField();

    await user.click(screen.getByRole('button', { name: 'Remove image' }));

    // AlertDialogContent renders the title
    expect(
      screen.getByText(`Remove ${ITEM_IMAGE_CONFIG.propertyDisplayName}?`),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('confirm remove calls onChange with null', async () => {
    const user = userEvent.setup();
    const { onChange } = renderField();

    // Open the dialog
    await user.click(screen.getByRole('button', { name: 'Remove image' }));
    // Click the destructive Remove action
    await user.click(screen.getByRole('button', { name: 'Remove' }));

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('disabled state applies opacity and blocks interaction', () => {
    renderField({ disabled: true });
    const root = document.querySelector('[data-slot="image-form-field"]');
    expect(root).toHaveClass('opacity-50');
    expect(root).toHaveClass('pointer-events-none');
  });

  it('applies config display names (label shows propertyDisplayName)', () => {
    renderField();
    expect(screen.getByText(ITEM_IMAGE_CONFIG.propertyDisplayName)).toBeInTheDocument();
  });
});

// Suppress unused defaultProps warning
void defaultProps;
