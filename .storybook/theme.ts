import { create } from 'storybook/theming';

export default create({
  base: 'light',
  brandTitle: 'Arda User Experience',
  brandUrl: 'https://arda.cards',
  brandTarget: '_self',

  // Colors
  colorPrimary: '#FC5A29',
  colorSecondary: '#FC5A29',

  // UI
  appBg: '#F8F9FA',
  appContentBg: '#FFFFFF',
  appBorderColor: '#E5E5E5',
  appBorderRadius: 8,

  // Text
  textColor: '#0A0A0A',
  textMutedColor: '#737373',
  textInverseColor: '#FFFFFF',

  // Toolbar
  barTextColor: '#737373',
  barSelectedColor: '#FC5A29',
  barBg: '#FFFFFF',

  // Form
  inputBg: '#FFFFFF',
  inputBorder: '#E5E5E5',
  inputTextColor: '#0A0A0A',
  inputBorderRadius: 6,
});
