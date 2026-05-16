import React from 'react';

export function BrowserRouter({ children }) {
  return <>{children}</>;
}

export function Routes({ children }) {
  return <>{children}</>;
}

export function Route({ element }) {
  return element;
}

export function NavLink({ children, to, className, ...props }) {
  const resolvedClassName = typeof className === 'function' ? className({ isActive: false }) : className;
  return (
    <a href={to} className={resolvedClassName} {...props}>
      {children}
    </a>
  );
}
