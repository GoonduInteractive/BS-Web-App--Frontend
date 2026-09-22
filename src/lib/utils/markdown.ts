/**
 * The top-level blocks of a piece of markdown or plain text — what a blank
 * line separates: a paragraph, a whole list, a heading.
 *
 * DECAP'S RICH-TEXT EDITOR WRITES ITS EMPTY LINES AS HARD BREAKS: pressing
 * Enter twice lands in the file as U+2028 LINE SEPARATOR characters and a `\`
 * at the end of the line, followed by lines holding only `\`. To markdown that
 * is one paragraph with `<br>`s in it, and to a naive split one block. So the
 * separators become newlines, a line that is only a backslash becomes a blank
 * line, and a backslash left dangling before a blank line is dropped — while a
 * single `\` between two lines of text, a real line break, is kept. Plain
 * `text` widgets never write any of that, and pass through untouched.
 */
export function splitBlocks(text: string): string[] {
  const normalised = text
    .replace(/\r\n/g, "\n")
    .replace(/[\u2028\u2029]/g, "\n")
    .replace(/^[ \t]*\\[ \t]*$/gm, "")
    .replace(/[ \t]*\\[ \t]*\n(?=[ \t]*\n)/g, "\n");
  return normalised
    .split(/\n[ \t]*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
}
