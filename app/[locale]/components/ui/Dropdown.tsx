import React, { forwardRef } from "react";

type DropdownProps = {
  children?: React.ReactNode;
  className?: string;
  id?: string;
};

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  ({ children, className = "", id }, ref) => {
    return (
      <div ref={ref} id={id} className={`${className}`}>
        {children}
      </div>
    );
  },
);

Dropdown.displayName = "Dropdown";

export default Dropdown;
