/**
 *
 * ColorModeSwitch
 *
 * Light, dark, or follow the system
 *
 */
import { faDesktop, faMoon, faSun, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { memo } from 'react';
import styled from 'styled-components';
import { ColorMode, useColorMode } from 'utils/colorMode';

const OPTIONS: { mode: ColorMode; label: string; icon: IconDefinition }[] = [
  { mode: 'light', label: 'Light', icon: faSun },
  { mode: 'dark', label: 'Dark', icon: faMoon },
  { mode: 'system', label: 'System', icon: faDesktop },
];

export const ColorModeSwitch = memo(() => {
  const [mode, setMode] = useColorMode();

  return (
    <Group role="radiogroup" aria-label="Color mode">
      {OPTIONS.map(option => (
        <Option
          key={option.mode}
          type="button"
          role="radio"
          aria-checked={mode === option.mode}
          aria-label={option.label}
          title={option.label}
          onClick={() => setMode(option.mode)}
        >
          <FontAwesomeIcon icon={option.icon} fixedWidth />
        </Option>
      ))}
    </Group>
  );
});

const Group = styled.div`
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border: 1px solid var(--db-border);
  border-radius: 10px;
  background: var(--db-surface-muted);
`;

const Option = styled.button`
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 26px;
  border: 0;
  border-radius: 7px;
  font-size: 12px;
  color: var(--db-text-muted);
  background: transparent;
  transition:
    background 0.15s var(--db-ease),
    color 0.15s var(--db-ease);

  &:hover {
    color: var(--db-heading);
  }

  &[aria-checked='true'] {
    color: var(--db-heading);
    background: var(--db-surface);
    box-shadow: var(--db-shadow-sm);
  }
`;
