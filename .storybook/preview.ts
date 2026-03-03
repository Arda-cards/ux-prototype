import type { Preview } from '@storybook/react-vite';
import { withAgentation } from './addons/agentation-toggle/with-agentation';
import { withFullAppProviders } from '../src/decorators/with-full-app-providers';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { handlers } from '@frontend/mocks/handlers';

import '../src/styles/extras/globals.css';
import '../src/styles/extras/ag-theme-arda.css';

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
            ['Atoms', 'Molecules', 'Organisms', '*'],
            'Extras',
            ['Atoms', 'Molecules', 'Organisms', '*'],
            '*',
          ],
          'Visual Elements',
          'Dev Witness',
          'Canary Refactor',
          'Use Cases',
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
