import { useLocation } from 'react-router';

export default function useQueryParams(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}
