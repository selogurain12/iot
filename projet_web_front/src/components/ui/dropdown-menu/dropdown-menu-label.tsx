import { forwardRef } from "react";
import { Label } from "@radix-ui/react-dropdown-menu";

import { cn } from "../../../lib/utils";

const dropdownMenuLabel = forwardRef<
	React.ElementRef<typeof Label>,
	React.ComponentPropsWithoutRef<typeof Label> & {
		inset?: boolean;
	}
>(({ className, inset, ...props }, reference) => (
	<Label
		className={cn(
			"px-2 py-1.5 text-sm font-semibold",
			(inset ?? false) && "pl-8",
			className
		)}
		ref={reference}
		{...props}
	/>
));
dropdownMenuLabel.displayName = Label.displayName;
dropdownMenuLabel.defaultProps = {
	inset: false,
};

export { dropdownMenuLabel as DropdownMenuLabel };
