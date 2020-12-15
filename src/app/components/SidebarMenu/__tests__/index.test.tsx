import * as React from 'react';
import { render } from '@testing-library/react';

import { SidebarMenu } from '..';

describe('<SidebarMenu  />', () => {
  it('should match snapshot', () => {
    const loadingIndicator = render(<SidebarMenu />);
    expect(loadingIndicator.container.firstChild).toMatchSnapshot();
  });
});
