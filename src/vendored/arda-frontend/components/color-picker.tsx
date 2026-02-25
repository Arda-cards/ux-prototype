import type { NextPage } from 'next';
import styles from './color-picker.module.css';
import type { ItemColor } from '@frontend/types/items';

export type ColorPickerType = {
  className?: string;
  onClose?: () => void;
  onColorSelect?: (color: ItemColor) => void;
  colorOptions?: Array<{ value: ItemColor; color: string; name: string }>;
};

const ColorPicker: NextPage<ColorPickerType> = ({
  className = '',
  onClose,
  onColorSelect,
  colorOptions = [],
}) => {
  // onClose will be used for additional functionality in the future
  console.log('ColorPicker rendered', { onClose });

  const handleColorClick = (colorValue: ItemColor) => {
    onColorSelect?.(colorValue);
  };

  return (
    <div className={[styles.colorPicker, className].join(' ')}>
      <div className={styles.colorGrid}>
        {colorOptions.map((colorOption) => (
          <div
            key={colorOption.value}
            className={styles.colorItem}
            onClick={() => handleColorClick(colorOption.value)}
            style={{ backgroundColor: colorOption.color }}
            title={colorOption.name}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
