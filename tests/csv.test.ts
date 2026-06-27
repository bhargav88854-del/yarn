import { describe, it, expect } from "vitest";
import { parseCsv, toCsv } from "@/lib/csv";

describe("parseCsv", () => {
  it("parses simple rows", () => {
    expect(parseCsv("a,b\n1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("handles quoted fields with embedded commas", () => {
    const rows = parseCsv('name,supplier\nSilk,"Mills, Sons & Co"');
    expect(rows[1]).toEqual(["Silk", "Mills, Sons & Co"]);
  });

  it("handles escaped quotes", () => {
    const rows = parseCsv('a\n"He said ""hi"""');
    expect(rows[1]).toEqual(['He said "hi"']);
  });

  it("handles embedded newlines inside quotes", () => {
    const rows = parseCsv('a\n"line1\nline2"');
    expect(rows).toEqual([["a"], ["line1\nline2"]]);
  });

  it("treats CRLF as one record break and strips a BOM", () => {
    const rows = parseCsv("﻿a,b\r\n1,2\r\n");
    expect(rows).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});

describe("toCsv", () => {
  it("quotes fields with commas, quotes, or newlines", () => {
    const csv = toCsv(["name", "note"], [
      { name: "A,B", note: 'has "quote"' },
    ]);
    expect(csv).toBe('name,note\r\n"A,B","has ""quote"""');
  });

  it("round-trips through parseCsv", () => {
    const headers = ["name", "supplier"];
    const rows = [{ name: "Silk", supplier: "Mills, Sons & Co" }];
    const parsed = parseCsv(toCsv(headers, rows));
    expect(parsed[0]).toEqual(headers);
    expect(parsed[1]).toEqual(["Silk", "Mills, Sons & Co"]);
  });
});
