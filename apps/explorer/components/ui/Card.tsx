import { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
}

export const Card = ({ children, className = '', ...props }: CardProps): JSX.Element => {
  const baseStyles = 'bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200';
  const combinedClassName = `${baseStyles} ${className}`;

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
};
