import type { Preview } from '@storybook/react-vite';
import { withAgentation } from './addons/agentation-toggle/with-agentation';
import { withFullAppProviders } from '../src/decorators/with-full-app-providers';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { handlers } from '@frontend/mocks/handlers';

import '../src/styles/globals.css';
import '../src/styles/ag-theme-arda.css';

// MSW initialization — runs once before any story mounts
initialize({ onUnhandledRequest: 'bypass' });

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
          'Start Here',
          ['Overview', 'Getting Started', 'Changelog', '*'],
          'Guides',
          [
            'Components',
            ['Classification', 'Guidelines', 'Usage Patterns', ['Creating Entity Viewers']],
            'Workflows',
            [
              'Developer Workflow',
              'Creating Stories',
              'Migration Components',
              ['How to Extract and Publish', 'Example'],
              'Publishing',
              'From Figma',
            ],
            'Tools',
            ['Agentation'],
            '*',
          ],
          'Styles',
          ['Style Guide', 'Colors', 'Brand Assets', 'Icons', '*'],
          'Components',
          [
            'Overview',
            'Stable',
            [
              'Atoms',
              ['Overview', 'Badge', 'Button', 'ConfirmDialog', 'Form', 'Grid', '*'],
              'Molecules',
              ['Overview', '*'],
              'Organisms',
              ['Overview', 'Shared', 'Reference', '*'],
              '*',
            ],
            'Canary',
            ['Atoms', 'Molecules', 'Organisms', '*'],
            '*',
          ],
          'App',
          [
            'Overview',
            'Reference',
            ['Home', 'Reference', 'Resources', 'System', 'Transactions', '*'],
            'Canary',
            '*',
          ],
          'Prototypes',
          ['Overview', 'Structure', 'Reference', 'Samples', '*'],
          'Archive',
          ['About', 'Applications', ['Overview', '*'], '*'],
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
