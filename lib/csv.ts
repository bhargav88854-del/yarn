// Minimal RFC-4180-ish CSV helpers — no dependency.

/** Quote a field if it contains a comma, quote, or newline; double inner quotes. */
function escapeField(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Build a CSV string from a header row and object rows. */
export function toCsv(
  headers: string[],
  rows: Record<string, unknown>[]
): string {
  const lines = [headers.map(escapeField).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeField(row[h])).join(","));
  }
  return lines.join("\r\n");
}

/**
 * Parse a CSV string into rows of string fields. Handles quoted fields with
 * embedded commas, newlines, and escaped quotes (""). Skips a trailing newline.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  // Strip a UTF-8 BOM if present (Excel adds one).
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  for (let i = 0; i < src.length; i++) {
    const c = src[i];

    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      // Treat \r\n as a single break; swallow the paired char.
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      field = "";
      row = [];
    } else {
      field += c;
    }
  }

  // Flush the last field/row unless the file ended on a clean newline.
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}
