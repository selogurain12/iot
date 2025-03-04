import { Content } from "@radix-ui/react-navigation-menu";
import { forwardRef } from "react";

import { cn } from "../../../lib/utils";

const navigationMenuContent = forwardRef<
	React.ElementRef<typeof Content>,
	React.ComponentPropsWithoutRef<typeof Content>
>(({ className, ...props }, reference) => (
	<Content
		className={cn(
			"left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ",
			className
		)}
		ref={reference}
		{...props}
	/>
));
navigationMenuContent.displayName = Content.displayName;

export { navigationMenuContent as NavigationMenuContent };
