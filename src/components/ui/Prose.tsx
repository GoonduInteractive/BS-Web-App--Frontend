import Image from "next/image";
import Markdown, { type Components } from "react-markdown";

import { splitBlocks } from "@/lib/utils/markdown";

/**
 * Markdown the content team wrote, in the site's type.
 *
 * A SERVER COMPONENT ON PURPOSE. Every route that uses this is statically
 * generated, so the markdown becomes HTML at build and `react-markdown` never
 * reaches the browser - the payload budget is untouched.
 *
 * ONE RENDERER FOR EVERY BODY the CMS holds: an article's (Figma
 * `08-news/News Details.png`) and a legal page's section (`terms/`). Both
 * frames set the same thing - 14px body on a 23px pitch with plain bullets -
 * so they share this rather than drifting apart. The editor's toolbar can also
 * produce headings, links, emphasis and quotes, which no frame draws; those
 * are set in the site's own type so formatting never renders raw.
 */
const PARAGRAPH = "text-menu-fg/85 font-body text-body-sm leading-[1.4375rem]";
const HEADING = "font-display text-menu-fg leading-none font-semibold tracking-[-0.03em] uppercase";

/** react-markdown hands every component its hast `node`, which a DOM element must not receive. */
function dom<P extends { node?: unknown }>(props: P): Omit<P, "node"> {
  const rest = { ...props };
  delete rest.node;
  return rest;
}

const components: Components = {
  p: (props) => <p className={PARAGRAPH} {...dom(props)} />,
  h1: (props) => <h2 className={`${HEADING} text-h5`} {...dom(props)} />,
  h2: (props) => <h2 className={`${HEADING} text-h5`} {...dom(props)} />,
  h3: (props) => <h3 className={`${HEADING} text-h6`} {...dom(props)} />,
  h4: (props) => <h4 className={`${HEADING} text-h6`} {...dom(props)} />,
  a: (props) => (
    <a
      className="text-menu-fg decoration-menu-fg/50 hover:decoration-menu-fg focus-visible:outline-signal underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
      {...dom(props)}
    />
  ),
  strong: (props) => <strong className="text-menu-fg font-bold" {...dom(props)} />,
  // The frames draw a small round bullet outside the text, and a wrapped line
  // hangs under the first word rather than under the bullet.
  ul: (props) => <ul className={`${PARAGRAPH} list-disc space-y-1 pl-5`} {...dom(props)} />,
  ol: (props) => <ol className={`${PARAGRAPH} list-decimal space-y-1 pl-5`} {...dom(props)} />,
  blockquote: (props) => <blockquote className="border-linen border-l-2 pl-4" {...dom(props)} />,
  hr: () => <hr className="border-menu-fg/20" />,
  // A picture the editor placed in the text is drawn in the frame's body-image
  // box (737 x 348, `News Details.png`), exactly as the Body image field is.
  img: ({ src, alt }) =>
    typeof src === "string" ? (
      <span className="relative block aspect-[737/348] w-full overflow-hidden">
        <Image src={src} alt={alt ?? ""} fill sizes="(max-width: 1023px) 92vw, 60vw" className="object-cover object-[50%_38%]" />
      </span>
    ) : null,
};

export { splitBlocks };

/**
 * `blocks` is the markdown already split on blank lines, so a caller that has
 * to put something between two of them - the news detail's body picture, which
 * the frame drops after the third - can do that without this knowing.
 */
export function Prose({ blocks, className = "" }: { blocks: readonly string[]; className?: string }) {
  if (!blocks.length) return null;
  return (
    <div className={`[&>*+*]:mt-6 ${className}`}>
      {blocks.map((block, i) => (
        <Markdown key={i} components={components}>
          {block}
        </Markdown>
      ))}
    </div>
  );
}
