import * as Form from "@radix-ui/react-form"
import * as React from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const TextFieldRoot = React.forwardRef<
  React.ComponentRef<typeof Form.Field>,
  React.ComponentPropsWithoutRef<typeof Form.Field>
>(({ className, ...props }, ref) => (
  <Form.Field ref={ref} className={cn("flex flex-col gap-4", className)} {...props} />
))
TextFieldRoot.displayName = "TextFieldRoot"

const TextFieldLabel = React.forwardRef<
  React.ComponentRef<typeof Form.Label>,
  React.ComponentPropsWithoutRef<typeof Form.Label>
>(({ className, ...props }, ref) => (
  <Form.Label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none text-gray-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
TextFieldLabel.displayName = "TextFieldLabel"

const TextFieldInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof Input>
>(({ className, ...props }, ref) => (
  <Form.Control asChild>
    <Input ref={ref} className={cn(className)} {...props} />
  </Form.Control>
))
TextFieldInput.displayName = "TextFieldInput"

export { TextFieldRoot, TextFieldLabel, TextFieldInput }
