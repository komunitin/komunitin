import { marked } from "marked";

export default function(value: string ): string {
  return marked(value, {
    gfm: true,
    breaks: true
  });
}
