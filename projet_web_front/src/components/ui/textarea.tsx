import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "../../lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, ...props }, reference) => (
		<textarea
			className={cn(
				"flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				className
			)}
			ref={reference}
			// eslint-disable-next-line react/jsx-props-no-spreading
			{...props}
		/>
	)
);
textarea.displayName = "Textarea";

export { textarea as Textarea, type TextareaProps };
