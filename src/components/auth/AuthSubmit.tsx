import { BracketButton } from "@/components/ui/BracketButton";

/**
 * The frames' red button: the site's signal button without its brackets, 44
 * tall, the label in Host Grotesk at 18. Busy while the call is in flight.
 */
export function AuthSubmit({ pending, children }: { pending: boolean; children: string }) {
  return (
    <BracketButton
      type="submit"
      brackets={false}
      disabled={pending}
      aria-busy={pending}
      className="px-4 py-3.25 font-medium tracking-normal whitespace-nowrap"
    >
      {children}
    </BracketButton>
  );
}
