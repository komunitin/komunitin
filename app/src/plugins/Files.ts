import { parse } from "lil-csv"

export async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export async function readCSV(file: File): Promise<string[][]> {
  const text = await readTextFile(file);
  return parse(text, { header: false }) as string[][]
}