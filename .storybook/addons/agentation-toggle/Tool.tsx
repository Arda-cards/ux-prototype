import React, { useCallback } from 'react';
import { useGlobals, useStorybookApi } from 'storybook/manager-api';
import { IconButton } from 'storybook/internal/components';
import { ChatIcon } from '@storybook/icons';
import { ADDON_ID, PARAM_KEY } from './constants';

export function Tool() {
  const [globals, updateGlobals] = useGlobals();
  const api = useStorybookApi();

  const isActive = !!globals[PARAM_KEY];

  const toggle = useCallback(() => {
    updateGlobals({ [PARAM_KEY]: !isActive });
  }, [isActive, updateGlobals]);

  api.setAddonShortcut(ADDON_ID, {
    label: 'Toggle Agentation',
    defaultShortcut: ['ctrl', 'shift', 'A'],
    action: toggle,
  });

  return (
    <IconButton
      active={isActive}
      title="Toggle Agentation feedback overlay"
      onClick={toggle}
    >
      <ChatIcon />
    </IconButton>
  );
}
