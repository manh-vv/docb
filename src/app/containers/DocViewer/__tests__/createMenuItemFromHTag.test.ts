import { createMenuItemFromHTag } from '../saga';

function heading(html: string) {
  const el = document.createElement('div');
  el.innerHTML = html;
  return el.querySelector('h1,h2,h3,h4,h5,h6') as HTMLHeadingElement;
}

describe('createMenuItemFromHTag', () => {
  it('reads the anchor that follows the heading in current GitHub markdown', () => {
    const hTag = heading(
      '<div class="markdown-heading"><h2 class="heading-element">Sub head</h2>' +
        '<a id="user-content-sub-head" class="anchor" href="#sub-head"></a></div>',
    );

    expect(createMenuItemFromHTag(hTag, 3)).toMatchObject({
      id: 'user-content-sub-head',
      href: '#sub-head',
      level: 2,
      order: 3,
      type: 'hash',
    });
  });

  it('reads the anchor nested inside the heading in older GitHub markdown', () => {
    const hTag = heading('<h1><a id="user-content-title" href="#title"></a>Title</h1>');

    expect(createMenuItemFromHTag(hTag, 0)).toMatchObject({
      id: 'user-content-title',
      href: '#title',
      level: 1,
    });
  });

  it('has no id when the heading has no anchor', () => {
    expect(createMenuItemFromHTag(heading('<h3>Plain</h3>'), 0).id).toBeUndefined();
  });
});
