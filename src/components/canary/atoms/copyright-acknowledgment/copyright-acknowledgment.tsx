import { cn } from '@/types/canary/utilities/utils';
import { Checkbox } from '@/components/canary/primitives/checkbox';
import { Label } from '@/components/canary/primitives/label';

export interface CopyrightAcknowledgmentStaticProps {}
export interface CopyrightAcknowledgmentInitProps {}

export interface CopyrightAcknowledgmentRuntimeProps {
  acknowledged: boolean;
  onAcknowledge: (acknowledged: boolean) => void;
  disabled?: boolean;
}

export type CopyrightAcknowledgmentProps = CopyrightAcknowledgmentStaticProps &
  CopyrightAcknowledgmentInitProps &
  CopyrightAcknowledgmentRuntimeProps;

const CHECKBOX_ID = 'copyright-acknowledgment-checkbox';

function CopyrightAcknowledgment({
  acknowledged,
  onAcknowledge,
  disabled = false,
}: CopyrightAcknowledgmentProps) {
  return (
    <div
      data-slot="copyright-acknowledgment"
      className={cn('flex items-start gap-3', disabled && 'opacity-50')}
      data-disabled={disabled || undefined}
    >
      <Checkbox
        id={CHECKBOX_ID}
        checked={acknowledged}
        onCheckedChange={(checked) => onAcknowledge(checked === true)}
        disabled={disabled}
        aria-label="Copyright acknowledgment"
      />
      <Label
        htmlFor={CHECKBOX_ID}
        className="text-foreground leading-snug font-normal cursor-pointer"
      >
        I confirm that I own or have a license to use this image, and that uploading infringing
        material may result in account termination.
      </Label>
    </div>
  );
}

export { CopyrightAcknowledgment };
