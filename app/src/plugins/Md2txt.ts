
import markdownToTxt from "markdown-to-txt";

export default function(value: string): string {
  return markdownToTxt(value);
}
