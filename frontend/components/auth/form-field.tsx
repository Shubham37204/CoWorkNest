import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormFieldProps = { id: string; label: string } & Omit<
  ComponentProps<typeof Input>,
  "id"
>;

export function FormField({ id, label, ...inputProps }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} {...inputProps} />
    </div>
  );
}
