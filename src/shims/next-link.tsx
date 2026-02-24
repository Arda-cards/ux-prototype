/**
 * next/link shim for Storybook
 *
 * Renders an <a> element. On click, prevents default and calls push(href)
 * from NavigationContext.
 */

import React, { useContext } from 'react';
import { NavigationContext } from './next-navigation';

interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string | { pathname: string; query?: Record<string, string> };
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  children?: React.ReactNode;
}

function Link({ href, children, replace: useReplace, onClick, ...rest }: LinkProps) {
  const ctx = useContext(NavigationContext);

  const resolvedHref = typeof href === 'string' ? href : href.pathname;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) onClick(e);
    if (useReplace) {
      ctx.replace(resolvedHref);
    } else {
      ctx.push(resolvedHref);
    }
  };

  return (
    <a href={resolvedHref} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

export default Link;
