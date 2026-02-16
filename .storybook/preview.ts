import type { Preview } from '@storybook/react';

import '../src/styles/globals.css';
import '../src/styles/ag-theme-arda.css';

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          'Docs',
          'Components',
          [
            'Atoms',
            ['Guide', 'General', 'Display and Layout', 'Grid', 'Form', 'Other'],
            'Molecules',
            ['Guide', '*'],
            'Organisms',
            ['Guide', 'Shared', 'Reference', '*'],
            '*',
          ],
          'Visual Elements',
          'Applications',
          'Use Cases',
          '*',
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
