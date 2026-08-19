import { env } from "cloudflare:workers";

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS sessions (
  code TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;

async function ready() {
  if (!env.DB) throw new Error("Banco compartilhado indisponível");
  await env.DB.prepare(CREATE_TABLE).run();
  return env.DB;
}

export async function GET(request: Request) {
  try {
    const code = new URL(request.url).searchParams.get("code")?.toUpperCase();
    if (!code) return Response.json({ error: "Informe o código da sessão" }, { status: 400 });
    const db = await ready();
    const row = await db.prepare("SELECT state FROM sessions WHERE code = ?").bind(code).first<{state:string}>();
    if (!row) return Response.json({ error: "Sessão não encontrada" }, { status: 404 });
    return Response.json({ state: JSON.parse(row.state) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao carregar sessão" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as {code?:string;state?:unknown};
    const code = payload.code?.trim().toUpperCase();
    if (!code || !payload.state) return Response.json({ error: "Código e estado são obrigatórios" }, { status: 400 });
    const db = await ready();
    const now = new Date().toISOString();
    await db.prepare(`INSERT INTO sessions (code, state, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(code) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at`)
      .bind(code, JSON.stringify(payload.state), now).run();
    return Response.json({ ok: true, code });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao salvar sessão" }, { status: 500 });
  }
}
