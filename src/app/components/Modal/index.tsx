/**
 *
 * Modal
 *
 * A centred dialog on a native <dialog>, which traps focus and closes on Escape.
 * Clicking the backdrop closes it too.
 *
 */
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { memo, ReactNode, useEffect, useId, useRef } from 'react';
import styled from 'styled-components';
import { compact } from 'styles/media';

interface Props {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** shown above the title */
  icon?: ReactNode;
  children?: ReactNode;
}

export const Modal = memo(({ open, onClose, title, icon, children }: Props) => {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal?.();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <Dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // a click on the dialog element itself, outside the panel, is a click on the backdrop
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {open && (
        <Panel>
          <Close type="button" aria-label="Close" title="Close" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </Close>
          {icon && <Hero aria-hidden="true">{icon}</Hero>}
          <Title id={titleId}>{title}</Title>
          {children}
        </Panel>
      )}
    </Dialog>
  );
});

const Dialog = styled.dialog`
  width: min(420px, calc(100vw - 32px));
  max-height: calc(100dvh - 32px);
  padding: 0;
  border: 1px solid var(--db-border);
  border-radius: var(--db-radius-lg);
  color: var(--db-text);
  background: var(--db-surface);
  box-shadow: var(--db-shadow-lg);

  &[open] {
    animation: modal-in 0.2s var(--db-ease);
  }

  &::backdrop {
    background: rgb(0 0 0 / 0.4);
    backdrop-filter: blur(2px);
  }

  @keyframes modal-in {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.98);
    }
  }
`;

const Panel = styled.div`
  position: relative;
  padding: 28px 28px 24px;

  @media ${compact} {
    padding: 24px 20px 20px;
  }
`;

const Close = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  font-size: 15px;
  color: var(--db-text-muted);
  background: transparent;

  &:hover {
    color: var(--db-heading);
    background: var(--db-surface-muted);
  }
`;

const Hero = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
`;

const Title = styled.h2`
  margin: 0 0 6px;
  font-family: var(--db-font-reading);
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-align: center;
  color: var(--db-heading);
`;
