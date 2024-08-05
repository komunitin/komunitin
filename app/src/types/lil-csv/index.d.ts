/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "lil-csv" {
  type CsvHeaderOption = 
      | boolean 
      | string[] 
      | { 
        [key: string]: 
        | boolean 
        | string 
        | ((value: any) => any) 
        | { newName?: string; stringify?: (value: any) => string; parse?: (value: string) => any } 
      };

  interface ParseOptions {
    header?: CsvHeaderOption;
    delimiter?: string;
    quoteChar?: string;
    escapeChar?: string;
  }

  interface GenerateOptions {
    header?: CsvHeaderOption;
    delimiter?: string;
    lineTerminator?: string;
    quoteChar?: string;
    escapeChar?: string;
    wrapStrings?: boolean;
  }

  export function parse(
    str: string, 
    options?: ParseOptions
  ): object[] | string[];

  export function generate(
    rows: object[] | string[],
    options?: GenerateOptions
  ): string;
}