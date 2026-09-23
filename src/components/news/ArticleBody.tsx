import { Prose, splitBlocks } from "@/components/ui/Prose";

/**
 * An article's body. The renderer itself is `ui/Prose`, shared with the legal
 * pages since both frames set the same 14 / 23 body; this keeps the name the
 * news components have always called it by.
 */
export { splitBlocks };

export function ArticleBody({ blocks, className }: { blocks: readonly string[]; className?: string }) {
  return <Prose blocks={blocks} className={className} />;
}
