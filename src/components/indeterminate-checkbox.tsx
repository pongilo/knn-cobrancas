import { useEffect, useRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export function IndeterminateCheckbox({
  indeterminate,
  ...rest
}: { indeterminate?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = Boolean(indeterminate) && !rest.checked;
    }
  }, [indeterminate, rest.checked]);

  return <input type="checkbox" ref={ref} {...rest} />;
}
