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
          'Docs',
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
          'Applications',
          'Dev Witness',
          'Canary Refactor',
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
