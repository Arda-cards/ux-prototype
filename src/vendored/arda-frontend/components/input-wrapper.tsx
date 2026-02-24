import type { NextPage } from 'next';
import { useState, useRef, useCallback } from 'react';
import ColorPicker from './color-picker';
import styles from './input-wrapper.module.css';
import type { ItemColor } from '@frontend/types/items';

const colorOptions = [
  { value: 'YELLOW' as ItemColor, color: '#FDE047', name: 'Yellow' },
  { value: 'RED' as ItemColor, color: '#EF4444', name: 'Red' },
  { value: 'GREEN' as ItemColor, color: '#22C55E', name: 'Green' },
  { value: 'BLUE' as ItemColor, color: '#3B82F6', name: 'Blue' },
  { value: 'ORANGE' as ItemColor, color: '#F97316', name: 'Orange' },
  { value: 'PURPLE' as ItemColor, color: '#A855F7', name: 'Purple' },
  { value: 'PINK' as ItemColor, color: '#EC4899', name: 'Pink' },
  { value: 'GRAY' as ItemColor, color: '#6B7280', name: 'Gray' },
  { value: 'BLACK' as ItemColor, color: '#000000', name: 'Black' },
  { value: 'WHITE' as ItemColor, color: '#FFFFFF', name: 'White' },
];

interface InputWrapperProps {
  value?: ItemColor;
  onChange?: (color: ItemColor) => void;
}

const InputWrapper: NextPage<InputWrapperProps> = ({ value, onChange }) => {
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const [isColorPickerOpen, setColorPickerOpen] = useState(false);

  const openColorPicker = useCallback(() => {
    setColorPickerOpen((prev) => !prev);
  }, []);

  const closeColorPicker = useCallback(() => {
    setColorPickerOpen(false);
  }, []);

  const handleColorSelect = useCallback(
    (colorValue: ItemColor) => {
      onChange?.(colorValue);
      closeColorPicker();
    },
    [onChange, closeColorPicker]
  );

  // Get the current color display value
  const currentColorOption = colorOptions.find(
    (option) => option.value === value
  );
  const displayColor = currentColorOption?.color || '#cbd5e1';

  return (
    <>
      <div className={styles.inputWrapper}>
        <div
          className={styles.input}
          ref={inputContainerRef}
          onClick={openColorPicker}
        >
          <div
            className={styles.fill}
            style={{ backgroundColor: displayColor }}
          />
        </div>
      </div>
      {isColorPickerOpen && (
        <>
          <div
            className='fixed inset-0 z-40 bg-black bg-opacity-30'
            onClick={closeColorPicker}
          />
          <div
            className='relative z-50 mt-2'
            onClick={(e) => e.stopPropagation()}
          >
            <ColorPicker
              onClose={closeColorPicker}
              onColorSelect={handleColorSelect}
              colorOptions={colorOptions}
            />
          </div>
        </>
      )}
    </>
  );
};

export default InputWrapper;
