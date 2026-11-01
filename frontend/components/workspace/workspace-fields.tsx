//Role:"Shared Name and Description inputs"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  WORKSPACE_DESCRIPTION_MAX,
  WORKSPACE_NAME_MAX,
} from "@/types/workspace";

type WorkspaceFieldsProps = {
  idPrefix: string;
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  disabled?: boolean;
};

export function WorkspaceFields({
  idPrefix,
  name,
  description,
  onNameChange,
  onDescriptionChange,
  disabled,
}: WorkspaceFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Name</Label>
        <Input
          id={`${idPrefix}-name`}
          maxLength={WORKSPACE_NAME_MAX}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-description`}>Description (optional)</Label>
        <Textarea
          id={`${idPrefix}-description`}
          maxLength={WORKSPACE_DESCRIPTION_MAX}
          rows={3}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          disabled={disabled}
        />
      </div>
    </>
  );
}
