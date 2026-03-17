import type { Preview } from '@storybook/react-vite';
import { withAgentation } from './addons/agentation-toggle/with-agentation';
import { withFullAppProviders } from '../src/decorators/with-full-app-providers';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { handlers } from '@frontend/mocks/handlers';

import '../src/styles/globals.css';

// MSW initialization — runs once before any story mounts.
// When Storybook is built with a non-root base path (e.g., /ux-prototype/ on
// GitHub Pages), Vite sets import.meta.env.BASE_URL accordingly. MSW must
// register its service worker at the correct path — otherwise the browser
// rejects the registration because the default `/mockServiceWorker.js` falls
// outside the deployment scope.
initialize({
  onUnhandledRequest: 'bypass',
  serviceWorker: {
    url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
  },
});

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
            [
              'Business Affiliates',
              [
                'Description',
                'BA-0001 Browse and Search',
                [
                  'Description',
                  '0001 View Suppliers List',
                  '0002 Search by Name',
                  '0003 Toggle Column Visibility',
                  '0005 Select Multiple',
                  '0006 Pagination',
                  '0007 Deep Link',
                ],
                'BA-0002 View Details',
                ['Description', '0001 Supplier Details Panel'],
                'BA-0003 Create Supplier',
                [
                  'Description',
                  '0001 Happy Path',
                  '0002 Validation Errors',
                  '0003 [Experimental] Wizard',
                ],
                'BA-0004 Edit Supplier',
                ['Description', '0001 Happy Path', '0002 Validation Errors'],
                'BA-0005 Delete Supplier',
                [
                  'Description',
                  '0001 Delete from List',
                  '0002 Delete from Detail Panel',
                  '0003 Delete Error',
                ],
                'BR-0002 Affiliate Typeahead',
                ['Description', '0002 Create on the Fly'],
                '*',
              ],
              '*',
            ],
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
