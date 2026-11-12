import React from "react";
import { Link } from "@/i18n/navigation";

type BaseLinkProps = React.ComponentProps<typeof Link>;

const BaseLink = React.forwardRef<
  HTMLAnchorElement,
  BaseLinkProps
>(({ children, ...props }, ref) => {
  return (
    <Link {...props} ref={ref}>
      {children}
    </Link>
  );
});

BaseLink.displayName = "BaseLink";

export default BaseLink;
