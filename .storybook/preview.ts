import type { Preview } from '@storybook/react-vite';
import { withAgentation } from './addons/agentation-toggle/with-agentation';
import { withFullAppProviders } from '../src/decorators/with-full-app-providers';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { handlers } from '@frontend/mocks/handlers';

import '../src/styles/globals.css';
import '../src/styles/ag-theme-arda.css';

initialize({ onUnhandledRequest: 'bypass', waitUntilReady: true });

const preview: Preview = {
  decorators: [withAgentation, withFullAppProviders],
  loaders: [mswLoader],
  initialGlobals: {
    agentationEnabled: false,
  },
  parameters: {
    msw: { handlers },
    options: {
      storySort: {
        order: [
          'Docs',
          [
            'About',
            'Arda Style Guide',
            'Getting Started',
            'Storybook Structure',
            ['Dev Witness', ['Contributing', 'Integration'], 'Use Cases'],
            'Workflows',
            [
              'Developer Workflow',
              'Creating Stories',
              'Canary Components',
              ['How to Extract and Publish', 'Example'],
              'Publishing',
            ],
            'Components',
            ['Classification', 'Guidelines', 'Usage Patterns', ['Creating Entity Viewers']],
            'Tools',
            ['Agentation'],
            'Misc',
            ['From Figma', 'Applications'],
          ],
          'Components',
          [
            'Atoms',
            ['Guide', 'General', 'Display and Layout', 'Grid', 'Form', 'Other'],
            'Molecules',
            ['Guide', '*'],
            'Organisms',
            ['Guide', 'Shared', 'Reference', '*'],
            'Canary',
            [
              'Atoms',
              [
                'Guide',
                'Avatar',
                'Badge',
                'BrandLogo',
                'Button',
                'Card',
                'Dialog',
                'Drawer',
                'IconButton',
                'IconLabel',
                'InputGroup',
                'ReadOnlyField',
                'SearchInput',
                'Grid',
                ['Guide', '*'],
                '*',
              ],
              'Molecules',
              [
                'Guide',
                'ActionToolbar',
                'DataGrid',
                'FieldList',
                'GridAction',
                'OverflowToolbar',
                'ItemDetails',
                ['Guide', '*'],
                'ItemGrid',
                ['Guide', '*'],
                'Sidebar',
                ['Guide', '*'],
                '*',
              ],
              'Organisms',
              [
                'Guide',
                'AppHeader',
                'ItemDetails',
                'ItemGrid',
                'Sidebar',
                'Shared',
                ['Guide', '*'],
                '*',
              ],
              'Primitives',
              '*',
            ],
            'Extras',
            ['Atoms', 'Molecules', 'Organisms', '*'],
            '*',
          ],
          'Visual Elements',
          [
            'Brand Assets',
            'Colors',
            'Icons',
            'Vendored',
            ['Brand Assets', 'Colors', 'Icons'],
            'Canary',
            ['Brand Assets', 'Colors', 'Icons'],
          ],
          'Dev Witness',
          'Canary Refactor',
          'Use Cases',
          [
            'Reference',
            ['Business Affiliates', '*'],
            'Procurement',
            ['Context', 'References', 'Orders', 'Receiving', '*'],
            'Samples',
            '*',
          ],
          'Archive',
          ['About', 'Applications', '*'],
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
