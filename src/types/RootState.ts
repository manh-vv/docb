import { DocViewerState } from 'app/containers/DocViewer/types';

import { BookCollectionState } from 'app/containers/BookCollection/types';
// [IMPORT NEW CONTAINERSTATE ABOVE] < Needed for generating containers seamlessly

/* 
  Because the redux-injectors injects your reducers asynchronously somewhere in your code
  You have to declare them here manually
*/
export interface RootState {
  docViewer?: DocViewerState;
  bookCollection?: BookCollectionState;
  // [INSERT NEW REDUCER KEY ABOVE] < Needed for generating containers seamlessly
}
