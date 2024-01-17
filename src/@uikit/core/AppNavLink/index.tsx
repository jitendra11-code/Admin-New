import React, { Ref } from "react";
import { NavLink } from "react-router-dom";

interface AppNavLinkProps {
  activeClassName: string;
  className: string;

  [x: string]: any;
}

const AppNavLink = React.forwardRef(
  (
    { activeClassName, className, ...rest }: AppNavLinkProps,
    ref: Ref<HTMLAnchorElement>
  ) => {

    return (
      <NavLink
        ref={ref}
        to={rest.to}
        state={{
          apiType: rest.hasOwnProperty("apiType") && rest.apiType && typeof rest.apiType !== 'object' && rest.apiType ? rest.apiType : ""
        }}
        {...rest}
        className={({ isActive }) =>
          isActive ? `${activeClassName} ${className}` : className
        }
        children={rest.children}
      />
    );
  }
);

export default AppNavLink;
