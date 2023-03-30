// We import the source TS file markdown-to-txt/src/markdown-to-txt.ts because if
// we import "markdown-to-txt" it loads the full "lodash" library, while doing
// this way it loads the "lodash-es" ES module improving the bundle size.
import markdownToTxt from "markdown-to-txt/src/markdown-to-txt";

export default function(value: string): string {
  return markdownToTxt(value);
}
