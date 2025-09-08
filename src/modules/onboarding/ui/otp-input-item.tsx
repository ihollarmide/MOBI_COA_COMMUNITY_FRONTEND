import { InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export function OTPInputItem({
  isCodeError,
  index,
}: {
  isCodeError: boolean;
  index: number;
}) {
  return (
    <InputOTPGroup className="w-full">
      <InputOTPSlot
        aria-invalid={isCodeError}
        className="w-full aspect-square text-2xl text-white"
        index={index}
      />
    </InputOTPGroup>
  );
}
