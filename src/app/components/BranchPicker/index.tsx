/**
 *
 * BranchPicker
 *
 * Choose the branch a book is read from. Lists up to 100 branches, the default one first.
 *
 */
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { memo, useEffect, useId, useState } from 'react';
import styled from 'styled-components';
import githubApi from 'utils/githubApi';

interface Props {
  username: string;
  repository: string;
  /** the branch being read, undefined for the default one */
  branch?: string;
  /** called with the chosen branch, undefined for the default one */
  onChange: (branch?: string) => void;
}

interface Branches {
  defaultBranch: string;
  names: string[];
}

export const BranchPicker = memo(({ username, repository, branch, onChange }: Props) => {
  const id = useId();
  const [branches, setBranches] = useState<Branches>();

  useEffect(() => {
    let live = true;
    setBranches(undefined);
    const repo = `/repos/${username}/${repository}`;
    // both responses are cached for the session, see utils/fetchCache
    Promise.all([githubApi(repo), githubApi(`${repo}/branches?per_page=100`)])
      .then(([info, list]) => {
        if (!live || !Array.isArray(list)) {
          return;
        }
        const defaultBranch: string = info.default_branch;
        const others = list.map(({ name }) => name).filter(name => name !== defaultBranch);
        setBranches({ defaultBranch, names: [defaultBranch, ...others] });
      })
      // without the list, the reader still works on the branch in the URL
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [username, repository]);

  if (!branches) {
    return null;
  }

  const current = branch || branches.defaultBranch;
  // a branch past the first 100, opened from a link, is still the one shown
  const names = branches.names.includes(current) ? branches.names : [...branches.names, current];

  return (
    <Picker>
      <label className="visually-hidden" htmlFor={id}>
        Branch
      </label>
      <BranchIcon icon={faCodeBranch} aria-hidden="true" />
      <select
        id={id}
        className="form-select form-select-sm"
        value={current}
        title="Branch"
        onChange={e => {
          const name = e.target.value;
          onChange(name === branches.defaultBranch ? undefined : name);
        }}
      >
        {names.map(name => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </Picker>
  );
});

const Picker = styled.div`
  position: relative;
  margin: 0 12px 14px;

  select {
    padding-left: 30px;
    font-family: var(--db-font-mono);
    font-size: 12px;
    color: var(--db-text);
    background-color: var(--db-surface);
    border-color: var(--db-border);
    border-radius: 8px;
    text-overflow: ellipsis;
  }
`;

const BranchIcon = styled(FontAwesomeIcon)`
  position: absolute;
  top: 50%;
  left: 11px;
  font-size: 11px;
  color: var(--db-text-muted);
  transform: translateY(-50%);
  pointer-events: none;
`;
