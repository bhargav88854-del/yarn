import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeReport } from "@/lib/reports";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

type ChatTurn = { role: "user" | "model"; text: string };

// Build a short live-inventory snapshot the model can answer questions against.
async function inventoryContext(): Promise<string> {
  const [yarns, txns] = await Promise.all([
    prisma.yarn.findMany({ orderBy: { quantity: "asc" } }),
    prisma.transaction.findMany({
      select: { type: true, quantity: true, date: true },
    }),
  ]);
  const r = computeReport(yarns, txns);

  const low = r.lowStock
    .slice(0, 15)
    .map(
      (y) =>
        `- ${y.yarnId} ${y.name} (${y.material}, ${y.location}): ${y.quantity} in stock, reorder at ${y.reorderLevel}`
    )
    .join("\n");

  const byMat = r.byMaterial
    .map((m) => `${m.material}: ${formatINR(m.value)}`)
    .join(", ");

  return [
    `Total stock value: ${formatINR(r.totalValue)} across ${r.totalStock} cones in ${yarns.length} yarn types.`,
    `Value by material: ${byMat || "none"}.`,
    `Low-stock items (${r.lowStock.length}):`,
    low || "none",
  ].join("\n");
}

// POST /api/chat — ask Google Gemini, grounded in the live inventory snapshot.
export async function POST(req: NextRequest) {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "Chatbot not configured: set GEMINI_API_KEY in .env" },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => null);
    const message: unknown = body?.message;
    if (typeof message !== "string" || message.trim() === "") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    const history: ChatTurn[] = Array.isArray(body?.history)
      ? body.history.slice(-10)
      : [];

    const context = await inventoryContext();
    const systemText =
      "You are the assistant for YarnTrack, a yarn/thread warehouse inventory app. " +
      "Answer concisely and practically. Prices are in Indian Rupees. Use the live " +
      "inventory snapshot below to answer stock questions. If the user asks to make a " +
      "change, explain where in the app to do it (Inventory, Transactions, Reorder, Reports). " +
      "If something isn't in the snapshot, say so.\n\nINVENTORY SNAPSHOT:\n" +
      context;

    const mapped = history
      .filter((t) => t && typeof t.text === "string")
      .map((t) => ({
        role: t.role === "model" ? "model" : "user",
        parts: [{ text: t.text }],
      }));
    // Gemini requires the first content to have role "user"; a sliced history
    // can begin on a model turn, which the API rejects with 400.
    while (mapped.length && mapped[0].role === "model") mapped.shift();

    const contents = [...mapped, { role: "user", parts: [{ text: message }] }];

    const payload = JSON.stringify({
      systemInstruction: { parts: [{ text: systemText }] },
      contents,
      generationConfig: {
        temperature: 0.3,
        // 2.5 models "think" and can burn the whole budget reasoning, leaving
        // a truncated answer (finishReason MAX_TOKENS). Disable thinking and
        // give a generous answer budget.
        maxOutputTokens: 1024,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    // Retry transient overloads (Google returns 503/500 when the model is busy).
    let res: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        }
      );
      if (res.ok || (res.status !== 503 && res.status !== 500)) break;
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }

    if (!res || !res.ok) {
      const status = res?.status ?? 0;
      const detail = res ? await res.text() : "";
      console.error("Gemini error", status, detail.slice(0, 300));
      if (status === 429) {
        return NextResponse.json(
          {
            error: `Gemini quota exceeded for model "${MODEL}". Try again later, set GEMINI_MODEL to a model your key has quota for, or enable billing.`,
          },
          { status: 429 }
        );
      }
      if (status === 503 || status === 500) {
        return NextResponse.json(
          { error: "Gemini is busy right now — please try again in a moment." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: "The assistant is unavailable right now" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const reply: string =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? "")
        .join("")
        .trim() || "Sorry, I couldn't generate a reply.";

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Failed to reach the assistant" }, { status: 500 });
  }
}
