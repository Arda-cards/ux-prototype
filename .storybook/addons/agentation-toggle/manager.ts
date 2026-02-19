import { addons, types } from 'storybook/manager-api';
import { ADDON_ID, TOOL_ID } from './constants';
import { Tool } from './tool';

addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    type: types.TOOL,
    match: ({ tabId, viewMode }) => !tabId && viewMode === 'story',
    render: Tool,
  });
});
