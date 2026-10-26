/*
 * Media queries utility
 */

import { css, CSSObject, Interpolation, RuleSet } from 'styled-components';

/*
 * Taken from https://github.com/DefinitelyTyped/DefinitelyTyped/issues/32914
 */

// Update your breakpoints if you want
export const sizes = {
  small: 600,
  medium: 1024,
  large: 1440,
  xlarge: 1920,
};

/** Below this width the contents sidebar becomes a drawer */
export const narrow = '(max-width: 860px)';

/** Phones */
export const compact = '(max-width: 520px)';

// Iterate through the sizes and create a media template
export const media = (Object.keys(sizes) as Array<keyof typeof sizes>).reduce(
  (acc, label) => {
    acc[label] = (first: any, ...interpolations: any[]) => css`
      @media (min-width: ${sizes[label]}px) {
        ${css(first, ...interpolations)}
      }
    `;

    return acc;
  },
  {} as { [key in keyof typeof sizes]: MediaFunction },
);

type MediaFunction = <P extends object>(
  first: TemplateStringsArray | CSSObject<P>,
  ...interpolations: Interpolation<P>[]
) => RuleSet<P>;

/* Example
const SomeDiv = styled.div`
  display: flex;
  ....
  ${media.medium`
    display: block
  `}
`;
*/
