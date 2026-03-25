import type { Preview } from '@storybook/react-vite';
import { withAgentation } from './addons/agentation-toggle/with-agentation';
import { withFullAppProviders } from '../src/decorators/with-full-app-providers';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { handlers } from '@frontend/mocks/handlers';

import '../src/styles/globals.css';
import '../src/styles/ag-theme-arda.css';

// MSW initialization — wrapped in try-catch so stories still render when the
// service worker can't register (e.g., Playwright headless, cross-origin iframes,
// or environments without ServiceWorker support).
try {
  initialize({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: './mockServiceWorker.js' },
  });
} catch {
  // Service worker registration failed — MSW handlers won't intercept requests
  // but stories will still render with real network calls or static data.
  console.warn(
    '[MSW] Service worker initialization failed — stories will render without mock handlers.',
  );
}

// Wrap mswLoader so that ServiceWorker failures (e.g., in Playwright headless,
// cross-origin iframes) don't crash story rendering.
const safeMswLoader: typeof mswLoader = async (context) => {
  try {
    return await mswLoader(context);
  } catch {
    // MSW loader failed — story renders without mock interception
    return {};
  }
};

const preview: Preview = {
  decorators: [withAgentation, withFullAppProviders],
  loaders: [safeMswLoader],
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
              'Utilities',
              'Atoms',
              [
                'Guide',
                'Avatar',
                ['Docs', '*', 'Playground'],
                'Badge',
                ['Docs', '*', 'Playground'],
                'BrandLogo',
                'Button',
                'Card',
                'CopyrightAcknowledgment',
                ['Docs', '*', 'Playground'],
                'Dialog',
                'Drawer',
                'IconButton',
                'IconLabel',
                'InputGroup',
                'ReadOnlyField',
                'SearchInput',
                'Grid',
                [
                  'Guide',
                  'Boolean',
                  ['Docs', '*', 'Playground'],
                  'Color',
                  ['Docs', '*', 'Playground'],
                  'Date',
                  ['Docs', '*', 'Playground'],
                  'Image',
                  ['Docs', '*', 'Playground'],
                  'Memo',
                  ['Docs', '*', 'Playground'],
                  'Number',
                  ['Docs', '*', 'Playground'],
                  'Select',
                  ['Docs', '*', 'Playground'],
                  'Text',
                  ['Docs', '*', 'Playground'],
                  '*',
                ],
                '*',
              ],
              'Molecules',
              [
                'Guide',
                'ActionToolbar',
                'DataGrid',
                'FieldList',
                'Form',
                ['Guide', 'ImageFormField', ['Docs', '*', 'Playground'], '*'],
                'GridAction',
                'ImageComparisonLayout',
                ['Docs', '*', 'Playground'],
                'ImageDisplay',
                ['Docs', '*', 'Playground'],
                'ImageDropZone',
                ['Docs', '*', 'Playground'],
                'ImageHoverPreview',
                ['Docs', '*', 'Playground'],
                'ImageInspectorOverlay',
                ['Docs', '*', 'Playground'],
                'ImagePreviewEditor',
                ['Docs', '*', 'Playground'],
                'ItemDetails',
                ['Guide', '*'],
                'ItemGrid',
                ['Guide', '*'],
                'OverflowToolbar',
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
                [
                  'Guide',
                  'Entity Data Grid',
                  [
                    'Docs',
                    'Auto Height',
                    'Client Pagination',
                    'Default',
                    'Discard All Drafts',
                    'Drag To Scroll',
                    'Empty',
                    'Interactive',
                    'Loading',
                    'Row Auto Publish',
                    'Row Auto Publish Error',
                    'Save All Drafts',
                    'With Actions Column',
                    'With Column Visibility',
                    'With Editing',
                    'With Filtering',
                    'With Image Column',
                    'With Multi Sort',
                    'With Pagination',
                    'With Search',
                    'With Search And Selection',
                    'With Toolbar',
                    'Playground',
                  ],
                  'Entity Data Grid Shim',
                  'ImageUploadDialog',
                  ['Docs', '*', 'Playground'],
                  '*',
                ],
                '*',
              ],
              'Primitives',
              [
                'Docs',
                'AlertDialog (Image Context)',
                'ImportCheck',
                'Skeleton (Image Context)',
                'Tabs (Image Context)',
                '*',
              ],
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
            'General Behaviors',
            ['Description', 'List Views', ['Description', '*'], '*'],
            'Reference',
            [
              'Business Affiliates',
              ['Description', '*', 'Ignore'],
              'Items',
              ['Description', '*'],
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
