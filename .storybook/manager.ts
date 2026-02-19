import { addons } from 'storybook/manager-api';
import ardaTheme from './theme';
import './addons/agentation-toggle/manager';

addons.setConfig({
  theme: ardaTheme,
  sidebar: {
    showRoots: true,
    collapsedRoots: [],
    renderLabel: (item) => item.name,
  },
});
