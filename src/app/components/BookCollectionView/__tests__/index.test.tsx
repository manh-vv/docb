import * as React from 'react';
import { render } from '@testing-library/react';

import { BookCollectionView } from '..';

describe('<BookCollectionView  />', () => {
  it('should match snapshot', () => {
    const loadingIndicator = render(<BookCollectionView item={{}} />);
    expect(loadingIndicator.container.firstChild).toMatchSnapshot();
  });
});
