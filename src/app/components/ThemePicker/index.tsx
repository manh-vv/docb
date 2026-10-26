/**
 *
 * ThemePicker
 *
 * A menu of the built-in themes, each shown with its light and dark colors
 *
 */
import { faCheck, faPalette } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { memo, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Theme, themes } from 'styles/themes';
import { useTheme } from 'utils/theme';

export const ThemePicker = memo(() => {
  const [theme, setTheme] = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function choose(id: string) {
    setTheme(id);
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <Root ref={rootRef}>
      <Trigger
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Theme"
        title="Theme"
        onClick={() => setOpen(o => !o)}
      >
        <FontAwesomeIcon icon={faPalette} fixedWidth />
      </Trigger>

      {open && (
        <Menu role="menu" aria-label="Theme">
          {themes.map(option => (
            <Item
              key={option.id}
              type="button"
              role="menuitemradio"
              aria-checked={theme === option.id}
              onClick={() => choose(option.id)}
            >
              <Swatch theme={option} />
              <span>{option.label}</span>
              {theme === option.id && <Check icon={faCheck} />}
            </Item>
          ))}
        </Menu>
      )}
    </Root>
  );
});

/** Light half, dark half, and the accent of each in the middle */
function Swatch({ theme }: { theme: Theme }) {
  return (
    <SwatchCircle
      aria-hidden="true"
      style={{
        background: `linear-gradient(135deg, ${theme.light.bg} 50%, ${theme.dark.bg} 50%)`,
      }}
    >
      <span style={{ background: theme.light.accent }} />
      <span style={{ background: theme.dark.accent }} />
    </SwatchCircle>
  );
}

const Root = styled.div`
  position: relative;
`;

const Trigger = styled.button`
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--db-border);
  border-radius: 10px;
  font-size: 13px;
  color: var(--db-text-muted);
  background: var(--db-surface-muted);
  transition: color 0.15s var(--db-ease);

  &:hover,
  &[aria-expanded='true'] {
    color: var(--db-heading);
  }
`;

const Menu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  min-width: 200px;
  padding: 6px;
  border: 1px solid var(--db-border);
  border-radius: 12px;
  background: var(--db-surface);
  box-shadow: var(--db-shadow-lg);
`;

const Item = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 0;
  border-radius: 8px;
  font-size: 13.5px;
  text-align: left;
  color: var(--db-text);
  background: transparent;

  &:hover {
    background: var(--db-surface-muted);
  }

  &[aria-checked='true'] {
    font-weight: 600;
    color: var(--db-heading);
  }
`;

const SwatchCircle = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border: 1px solid var(--db-border-strong);
  border-radius: 50%;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
`;

const Check = styled(FontAwesomeIcon)`
  margin-left: auto;
  font-size: 11px;
  color: var(--db-accent);
`;
