'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useRef } from 'react';

export function usePreserveDateParam() {
  const searchParams = useSearchParams();
  const dateParamRef = useRef<string | null>(null);
  
  const dateParam = searchParams.get('date');
  
  return useMemo(() => {
    dateParamRef.current = dateParam;
    
    return (href: string): string => {
      const currentDateParam = dateParamRef.current;
      
      if (!currentDateParam) {
        return href;
      }
      
      const [pathAndQuery, hash = ''] = href.split('#');
      const [pathname, existingQuery = ''] = pathAndQuery.split('?');
      const params = new URLSearchParams(existingQuery);
      
      params.set('date', currentDateParam);
      
      const queryString = params.toString();
      const urlWithQuery = queryString ? `${pathname}?${queryString}` : pathname;
      return hash ? `${urlWithQuery}#${hash}` : urlWithQuery;
    };
  }, [dateParam]);
}
