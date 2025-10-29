import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { buttonVariants } from "./button-variants"

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button"
  return (
      <Comp
          data-slot="button"
          className={cn(buttonVariants({ variant, size }), className)}
          {...props}
      />
  )
}

// only export components in this file
export { Button }
