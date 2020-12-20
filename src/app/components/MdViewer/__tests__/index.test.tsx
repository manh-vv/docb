import { render } from '@testing-library/react';
import * as React from 'react';

import { MdViewer } from '..';

describe('<MdViewer  />', () => {
  it('should match snapshot', () => {
    const loadingIndicator = render(<MdViewer htmlContent={''} />);
    expect(loadingIndicator.container.firstChild).toMatchSnapshot();
  });
});
