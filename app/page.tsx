"use client";

import { useMemo, useState } from "react";

type Phase = "incident" | "investigate" | "contain" | "result" | "redesign" | "debrief";
type Lens = "signals" | "architecture" | "risk" | "operations";
type Containment = "hold" | "authenticate" | "release" | "pause";

const phases: { id: Phase; label: string; minutes: number }[] = [
  { id: "incident", label: "Incidente", minutes: 3 },
  { id: "investigate", label: "Investigar", minutes: 8 },
  { id: "contain", label: "Conter", minutes: 6 },
  { id: "result", label: "Consequência", minutes: 3 },
  { id: "redesign", label: "Redesenhar", minutes: 10 },
  { id: "debrief", label: "Debrief", minutes: 10 },
];

const responsibilities: Record<Lens, {
  number: string; title: string; mandate: string; privateFact: string; authority: string;
  evidence: { id: string; label: string; finding: string; concept: string }[];
  action: string; actionResult: string; affects: Lens[];
}> = {
  signals: {
    number: "01", title: "Qualidade da recomendação", mandate: "Avaliar se a recomendação tem evidência suficiente para sustentar uma ação de alta consequência.",
    privateFact: "O score foi 0,87. O piloto reduziu perdas em 18%, mas 6,4% das retenções foram falsos positivos.",
    authority: "Você recomenda uma ação. Não pode liberar, reter nem alterar a regra.",
    evidence: [
      { id: "model", label: "Abrir saída do modelo", finding: "Score 0,87. Principais sinais: dispositivo novo, valor atípico e destinatário recente.", concept: "Modelo produz uma inferência; não executa uma ação." },
      { id: "agent", label: "Inspecionar agente de contexto", finding: "O agente tentou consultar viagem e autenticação. Ambas as ferramentas retornaram 'não encontrado'.", concept: "Agente combina objetivo, instruções e ferramentas." },
    ],
    action: "Recomendar autenticação adicional", actionResult: "A recomendação exige que Arquitetura confirme se o sinal pode entrar no fluxo a tempo.", affects: ["architecture", "risk"],
  },
  architecture: {
    number: "02", title: "Viabilidade técnica", mandate: "Determinar o que o sistema realmente consegue consultar, coordenar e executar dentro do prazo.",
    privateFact: "O agente consulta uma réplica do CRM atualizada a cada 6h. O resultado da autenticação está em outro domínio.",
    authority: "Você declara viabilidade e dependências. Não concede alçada nem aceita exposição de risco.",
    evidence: [
      { id: "orchestrator", label: "Abrir log do orquestrador", finding: "14:03:10 agente iniciado → 14:03:12 regra R-17 → 14:03:13 retenção executada.", concept: "Orquestrador coordena sequência, estado, timeout e fallback." },
      { id: "tools", label: "Ver ferramentas disponíveis", finding: "consultar_viagem lê uma réplica. consultar_autenticacao não está disponível para este agente.", concept: "A capacidade do agente é limitada por ferramentas e permissões." },
    ],
    action: "Declarar integração indisponível", actionResult: "Autenticação não pode ser usada automaticamente agora. Risco precisa autorizar outra contenção.", affects: ["risk", "operations"],
  },
  risk: {
    number: "03", title: "Autoridade e exposição", mandate: "Definir qual ação pode ocorrer, sob qual alçada e quem aceita a exposição residual.",
    privateFact: "A regra R-17 retém acima de 0,82 quando viagem não é encontrada. Foi aprovada antes do agente de contexto.",
    authority: "Você pode autorizar exceção, impor condição ou manter a retenção. Não declara viabilidade técnica.",
    evidence: [
      { id: "rule", label: "Inspecionar regra R-17", finding: "SE score > 0,82 E viagem = ausente, ENTÃO reter. Autenticação não participa da regra.", concept: "Regra autoriza; agente recomenda; conta técnica executa." },
      { id: "identity", label: "Ver identidade de execução", finding: "svc-payment-risk pode reter até R$ 500 mil sem aprovação adicional.", concept: "Permissão técnica e alçada de negócio são controles diferentes." },
    ],
    action: "Autorizar exceção condicionada", actionResult: "A exceção depende de execução manual e transfere pressão de prazo para Operações.", affects: ["operations", "signals"],
  },
  operations: {
    number: "04", title: "Capacidade operacional", mandate: "Confirmar se a contenção cabe no prazo, pode ser executada e terá responsável identificável.",
    privateFact: "A fila humana leva 40 min na mediana. Restam 18 min. A equipe absorve 11 dos 34 casos por hora previstos.",
    authority: "Você aceita ou rejeita o tratamento operacional. Não altera regra, modelo ou permissão.",
    evidence: [
      { id: "queue", label: "Consultar fila humana", finding: "23 casos aguardando. Previsão para este caso: 41 minutos. Prazo restante: 18 minutos.", concept: "Human in the loop só é controle quando tem tempo, contexto e autoridade." },
      { id: "execution", label: "Abrir registro da ação", finding: "A retenção foi executada por svc-payment-risk. O registro guarda a regra, mas não o contexto consultado.", concept: "Execução e rastreabilidade pertencem a camadas distintas." },
    ],
    action: "Declarar SLA inviável", actionResult: "A revisão humana deixa de ser um fallback válido. A mesa precisa escolher outra contenção.", affects: ["risk", "architecture"],
  },
};

const containmentOptions: { id: Containment; label: string; description: string }[] = [
  { id: "hold", label: "Manter retenção", description: "Protege contra fraude; operação perde o prazo." },
  { id: "authenticate", label: "Exigir autenticação", description: "Usa novo sinal; integração ainda não existe." },
  { id: "release", label: "Liberar por exceção", description: "Preserva a operação; aceita exposição residual." },
  { id: "pause", label: "Suspender automação", description: "Contém o sistema; aumenta volume manual." },
];

const redesignOptions = [
  { id: "realtime", label: "Consultar CRM no caminho crítico", resolves: "Contexto desatualizado", creates: "Dependência e +900 ms de latência" },
  { id: "auth", label: "Adicionar autenticação como ferramenta", resolves: "Sinal fora do fluxo", creates: "Nova permissão e fallback" },
  { id: "rule", label: "Versionar a regra por faixa de valor", resolves: "Alçada indiferenciada", creates: "Mais caminhos para testar" },
  { id: "trace", label: "Preservar contexto da execução", resolves: "Decisão não reconstruível", creates: "Custo e retenção de dados" },
];

export default function Home() {
  const [phase, setPhase] = useState<Phase>("incident");
  const [focus, setFocus] = useState<Lens | "grid">("grid");
  const [architectureOpen, setArchitectureOpen] = useState(false);
  const [architectureTab, setArchitectureTab] = useState<"diagram" | "inventory" | "parameters" | "docs">("diagram");
  const [opened, setOpened] = useState<string[]>([]);
  const [acted, setActed] = useState<Lens[]>([]);
  const [containment, setContainment] = useState<Containment | null>(null);
  const [executed, setExecuted] = useState(false);
  const [redesign, setRedesign] = useState<string[]>([]);
  const [feedback, setFeedback] = useState([
    "O fluxo automático reteve a transferência. A exceção foi escalada para a mesa.",
  ]);
  const [events, setEvents] = useState(["14:03:13 · retenção executada", "14:04:08 · cliente contestou", "14:05:02 · incidente escalado"]);

  const phaseIndex = phases.findIndex((item) => item.id === phase);
  const evidenceLeft = 4 - opened.length;
  const readiness = acted.length;
  const visibleRoles = focus === "grid" ? Object.keys(responsibilities) as Lens[] : [focus];
  const consequence = useMemo(() => {
    if (!containment) return null;
    return {
      hold: { title: "Prazo perdido", body: "A retenção permanece. A revisão humana chegará aproximadamente 23 minutos depois do vencimento.", tone: "bad" },
      authenticate: { title: "Ação não executável", body: "A autenticação foi concluída, mas o orquestrador não recebe esse resultado. A regra mantém a retenção.", tone: "warn" },
      release: { title: "Exceção executada", body: "A transferência foi liberada por autorização excepcional. A exposição residual precisa de responsável e registro.", tone: "good" },
      pause: { title: "Automação contida", body: "Novas retenções automáticas foram suspensas. A fila projetada sobe de 23 para 71 casos em uma hora.", tone: "warn" },
    }[containment];
  }, [containment]);

  function go(next: Phase) {
    setPhase(next);
    const label = phases.find((p) => p.id === next)?.label;
    setEvents((e) => [`agora · facilitador abriu ${label}`, ...e]);
  }

  function openEvidence(id: string, finding: string, concept: string) {
    if (opened.includes(id) || evidenceLeft <= 0) return;
    setOpened((current) => [...current, id]);
    setFeedback((current) => [`EVIDÊNCIA — ${finding} ${concept}`, ...current]);
    setEvents((current) => [`agora · mesa consultou ${id}`, ...current]);
  }

  function registerAction(lens: Lens) {
    if (acted.includes(lens)) return;
    const item = responsibilities[lens];
    setActed((current) => [...current, lens]);
    setFeedback((current) => [`IMPACTO — ${item.actionResult}`, ...current]);
    setEvents((current) => [`agora · ${item.title} registrou posição`, ...current]);
  }

  function executeContainment() {
    if (!containment) return;
    setExecuted(true);
    setPhase("result");
    setFeedback((current) => [`CONSEQUÊNCIA — ${consequence?.body}`, ...current]);
    setEvents((current) => ["agora · contenção executada", ...current]);
  }

  function toggleRedesign(id: string) {
    setRedesign((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  }

  return (
    <main className="simulator">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">O</span><span>ORQUESTRA</span><small>LAB</small></div>
        <div className="session-meta"><span className="live-dot" /> PILOTO · DIA 17 <b>INC-0241</b></div>
        <div className="header-actions"><button className="architecture-button" onClick={() => setArchitectureOpen(true)}>⌘ Arquitetura do piloto</button><span className="lab-chip">MODO LABORATÓRIO</span><button className="avatar">FR</button></div>
      </header>

      <nav className="phasebar" aria-label="Etapas da simulação">
        {phases.map((item, index) => (
          <button key={item.id} className={`phase ${phase === item.id ? "active" : ""} ${index < phaseIndex ? "done" : ""}`} onClick={() => go(item.id)}>
            <span>{index < phaseIndex ? "✓" : String(index + 1).padStart(2, "0")}</span><b>{item.label}</b><small>{item.minutes} min</small>
          </button>
        ))}
      </nav>

      <div className="sim-layout">
        <aside className="control-room">
          <div className="control-title"><small>PAINEL DO FACILITADOR</small><h2>Célula de incidente</h2><span><i /> 4 participantes conectados</span></div>
          <section>
            <label>MOMENTO ATUAL</label>
            <h3>{phases[phaseIndex].label}</h3>
            <p>{phase === "incident" && "Todos leem o incidente e sua responsabilidade privada."}{phase === "investigate" && "A mesa escolhe até quatro evidências para reconstruir a decisão."}{phase === "contain" && "Cada responsabilidade registra sua posição antes da contenção."}{phase === "result" && "O sistema devolve a consequência operacional da escolha."}{phase === "redesign" && "A mesa altera a arquitetura e assume novas restrições."}{phase === "debrief" && "Compare o percurso, não apenas a decisão final."}</p>
            {phaseIndex < phases.length - 1 && <button className="primary" onClick={() => go(phases[phaseIndex + 1].id)}>Avançar para {phases[phaseIndex + 1].label}<span>→</span></button>}
          </section>
          <section>
            <div className="section-head"><label>PROGRESSO DA MESA</label><b>{readiness}/4</b></div>
            {(Object.keys(responsibilities) as Lens[]).map((id) => <div className="readiness" key={id}><span className={acted.includes(id) ? "ready" : ""}>{acted.includes(id) ? "✓" : "·"}</span>{responsibilities[id].title}</div>)}
          </section>
          <section>
            <div className="section-head"><label>ORÇAMENTO DE INVESTIGAÇÃO</label><b>{Math.max(0, evidenceLeft)}/4</b></div>
            <p>Cada consulta consome tempo. Nem toda evidência estará disponível antes da decisão.</p>
          </section>
          <section className="timeline"><label>LINHA DO TEMPO</label>{events.slice(0, 6).map((event, i) => <p key={`${event}-${i}`}>{event}</p>)}</section>
        </aside>

        <section className="stage">
          <div className="incident-strip">
            <div className="incident-icon">!</div><div><small>INCIDENTE EM ANDAMENTO · PRAZO RESTANTE 18:00</small><h1>Transferência de R$ 180 mil retida pelo fluxo automático</h1><p>O cliente contesta a retenção. A autenticação adicional foi concluída, mas o fluxo padrão de exceção não responderá antes do vencimento.</p></div>
            <div className="incident-stats"><span><small>SCORE</small><b>0,87</b></span><span><small>REGRA</small><b>R-17</b></span><span><small>ESTADO</small><b>RETIDA</b></span></div>
          </div>

          {architectureOpen && <section className="architecture-window" role="dialog" aria-label="Arquitetura técnica do piloto">
            <header><div><small>DOCUMENTAÇÃO TÉCNICA · PILOTO FRAUD-GUARD V0.9.3</small><h2>Arquitetura do piloto</h2><p>Configuração implantada no dia 17 do piloto. Última alteração: regra R-17 v3.</p></div><button onClick={() => setArchitectureOpen(false)} aria-label="Fechar arquitetura">×</button></header>
            <nav>{[
              ["diagram", "Diagrama"], ["inventory", "Componentes"], ["parameters", "Parâmetros"], ["docs", "Documento técnico"],
            ].map(([id, label]) => <button key={id} className={architectureTab === id ? "active" : ""} onClick={() => setArchitectureTab(id as typeof architectureTab)}>{label}</button>)}</nav>
            {architectureTab === "diagram" && <div className="architecture-diagram">
              <div className="diagram-legend"><span><i className="owned" /> Banco</span><span><i className="cloud" /> Nuvem contratada</span><span><i className="external" /> Fornecedor externo</span></div>
              <div className="flow-diagram">
                <div className="flow-node owned"><small>ENTRADA</small><b>API de transferências</b><span>Core bancário</span></div><i>→</i>
                <div className="flow-node cloud central"><small>ORQUESTRAÇÃO</small><b>Decision Flow</b><span>Estado · timeout · fallback</span></div><i>→</i>
                <div className="flow-node owned"><small>DECISÃO</small><b>Motor de regras</b><span>R-17 v3</span></div><i>→</i>
                <div className="flow-node owned"><small>EXECUÇÃO</small><b>API de pagamentos</b><span>svc-payment-risk</span></div>
                <div className="branch from-orchestrator"><span>↳</span><div className="flow-node owned"><small>MODELO · 01</small><b>FraudScore XGB</b><span>Score 0–1</span></div><div className="flow-node cloud"><small>AGENTE · 01</small><b>Context Agent</b><span>LLM + 2 ferramentas</span></div></div>
                <div className="tool-branch"><div className="flow-node owned tool"><small>FERRAMENTA</small><b>consultar_viagem</b><span>Réplica CRM · 6h</span></div><div className="flow-node external tool"><small>FERRAMENTA</small><b>geo_context</b><span>API externa</span></div></div>
                <div className="human-node"><span>↓ fallback</span><div className="flow-node owned"><small>HUMAN IN THE LOOP</small><b>Fila de exceções</b><span>Mediana 40 min</span></div></div>
              </div>
              <div className="diagram-summary"><div><small>AGENTES</small><b>1</b><span>Context Agent</span></div><div><small>MODELOS</small><b>2</b><span>XGBoost + LLM externo</span></div><div><small>FERRAMENTAS</small><b>2</b><span>CRM + geolocalização</span></div><div><small>AÇÕES</small><b>3</b><span>Liberar · autenticar · reter</span></div></div>
            </div>}
            {architectureTab === "inventory" && <div className="inventory-table"><div className="table-row head"><span>Componente</span><span>Tipo / operação</span><span>Local</span><span>Limitação conhecida</span></div>{[
              ["Decision Flow", "Orquestrador", "Nuvem contratada · sa-east", "Fallback mantém retenção"],
              ["FraudScore XGB 4.7", "Modelo interno", "Nuvem privada do banco", "Não recebe contexto de viagem"],
              ["Context Agent 0.9", "Agente com LLM", "Nuvem contratada", "Ferramentas retornam cópias"],
              ["LLM Atlas Small", "Modelo de fornecedor", "API externa · Brasil", "Retenção de prompts: zero"],
              ["Rules Engine", "Motor determinístico", "Datacenter do banco", "R-17 anterior ao agente"],
              ["Exception Queue", "Operação humana", "SaaS interno", "Mediana de 40 minutos"],
            ].map((row) => <div className="table-row" key={row[0]}>{row.map((cell) => <span key={cell}>{cell}</span>)}</div>)}</div>}
            {architectureTab === "parameters" && <div className="parameters-grid">{[
              ["Limiar de retenção", "score > 0,82", "Regra R-17"], ["Timeout do fluxo", "30 minutos", "Fallback: manter retenção"],
              ["Atualização do CRM", "a cada 6 horas", "Última carga: 12:00"], ["Retry do agente", "2 tentativas", "Backoff: 500 ms"],
              ["Alçada da conta", "até R$ 500 mil", "svc-payment-risk"], ["Contexto enviado ao LLM", "resumo + sinais", "Sem nome ou CPF"],
              ["Capacidade humana", "11 casos/hora", "Demanda projetada: 34"], ["Retenção de logs", "90 dias", "Não guarda resposta das ferramentas"],
            ].map((item) => <article key={item[0]}><small>{item[0]}</small><b>{item[1]}</b><span>{item[2]}</span></article>)}</div>}
            {architectureTab === "docs" && <div className="technical-doc"><aside><small>ÍNDICE</small><a>1. Objetivo do piloto</a><a>2. Escopo de autonomia</a><a>3. Sequência de execução</a><a>4. Tratamento de falhas</a><a>5. Controles e responsáveis</a></aside><article><small>DOC-IA-024 · APROVADO PARA PILOTO</small><h3>Especificação do fluxo de decisão antifraude</h3><h4>1. Objetivo</h4><p>Reduzir perdas em transferências digitais sem permitir que modelos ou agentes movimentem recursos diretamente. Toda ação é autorizada pelo motor de regras e executada por uma identidade técnica segregada.</p><h4>2. Escopo de autonomia</h4><p>O Context Agent pode selecionar e chamar duas ferramentas de leitura. Não pode alterar dados, modificar regras ou chamar a API de pagamentos. O orquestrador mantém o estado e encaminha resultados ao Rules Engine.</p><h4>3. Condição de exceção</h4><p>Divergências com score superior a 0,82 são retidas e enviadas à fila humana. O documento assume atendimento em até 20 minutos; a capacidade operacional não foi revalidada após a expansão do piloto.</p><div className="doc-warning"><b>Lacuna identificada</b><span>A premissa de atendimento humano não corresponde à mediana atual de 40 minutos.</span></div></article></div>}
          </section>}

          <div className="stage-tools">
            <div><small>VISÕES DA SIMULAÇÃO</small><h2>{focus === "grid" ? "As quatro telas, simultaneamente" : responsibilities[focus].title}</h2></div>
            <div className="view-switch"><button className="arch-shortcut" onClick={() => setArchitectureOpen(true)}>⌘ Ver arquitetura</button><button className={focus === "grid" ? "selected" : ""} onClick={() => setFocus("grid")}>▦ Ver todas</button>{(Object.keys(responsibilities) as Lens[]).map((id) => <button key={id} className={focus === id ? "selected" : ""} onClick={() => setFocus(id)}>{responsibilities[id].number}</button>)}</div>
          </div>

          <div className={`participant-grid ${focus !== "grid" ? "focused" : ""}`}>
            {visibleRoles.map((id) => {
              const item = responsibilities[id];
              const received = feedback.filter((f) => item.affects.some((target) => feedback.some(() => target === id))).slice(0, 1);
              return <article className={`participant-screen ${id}`} key={id}>
                <header><div><small>TELA DO PARTICIPANTE · RESPONSABILIDADE {item.number}</small><h3>{item.title}</h3></div><span className="screen-live">AO VIVO</span></header>
                <div className="screen-body">
                  <div className="now-box"><small>SUA TAREFA AGORA</small><p>{phase === "incident" ? "Leia sua informação privada. Ainda não proponha uma solução." : phase === "investigate" ? "Escolha a evidência que sua responsabilidade considera decisiva." : phase === "contain" ? item.action : phase === "redesign" ? "Avalie as mudanças propostas e as novas dependências." : "Observe o que a decisão produziu no sistema."}</p></div>
                  <label>SEU MANDATO</label><p>{item.mandate}</p>
                  <div className="private-panel"><div><label>INFORMAÇÃO PRIVADA</label><span>Somente nesta tela</span></div><p>{item.privateFact}</p></div>
                  <label>SUA AUTORIDADE</label><p>{item.authority}</p>
                  {phase === "investigate" && <div className="evidence-actions">{item.evidence.map((e) => <button key={e.id} disabled={opened.includes(e.id) || evidenceLeft <= 0} onClick={() => openEvidence(e.id, e.finding, e.concept)}>{opened.includes(e.id) ? "✓ Evidência compartilhada" : e.label}</button>)}</div>}
                  {phase === "contain" && <button className={`role-action ${acted.includes(id) ? "complete" : ""}`} onClick={() => registerAction(id)} disabled={acted.includes(id)}>{acted.includes(id) ? "✓ Posição registrada" : item.action}</button>}
                  {received.length > 0 && phase === "contain" && <div className="incoming"><small>ATUALIZAÇÃO RECEBIDA</small><p>{received[0]}</p></div>}
                </div>
              </article>;
            })}
          </div>

          <section className="collective-feedback">
            <div className="feedback-title"><span>↳</span><div><small>FEEDBACK COLETIVO</small><h2>O estado da situação mudou</h2></div></div>
            <div className="feedback-feed">{feedback.slice(0, 3).map((item, i) => <article key={`${item}-${i}`} className={i === 0 ? "latest" : ""}><span>{i === 0 ? "AGORA" : `0${i + 1}`}</span><p>{item}</p></article>)}</div>
          </section>

          {(phase === "contain" || phase === "result") && <section className="containment-board">
            <div><small>DECISÃO DE CONTENÇÃO · MESA</small><h2>O que pode ser feito agora?</h2><p>Uma contenção não redesenha o sistema. Ela administra a exposição deste incidente com as capacidades disponíveis.</p></div>
            <div className="containment-options">{containmentOptions.map((option) => <button key={option.id} className={containment === option.id ? "selected" : ""} onClick={() => { setContainment(option.id); setExecuted(false); }}><span /> <b>{option.label}</b><small>{option.description}</small></button>)}</div>
            <div className="execute-box"><div><small>CONDIÇÃO DE EXECUÇÃO</small><strong>{readiness}/4 responsabilidades registradas</strong></div><button disabled={!containment || readiness < 4 || executed} onClick={executeContainment}>{executed ? "Executada" : "Executar contenção"}</button></div>
          </section>}

          {phase === "result" && consequence && <section className={`consequence ${consequence.tone}`}><small>RESULTADO DA EXECUÇÃO</small><h2>{consequence.title}</h2><p>{consequence.body}</p><button onClick={() => go("redesign")}>Redesenhar o processo →</button></section>}

          {(phase === "redesign" || phase === "debrief") && <section className="redesign-board"><div className="redesign-intro"><small>ARQUITETURA FUTURA</small><h2>O que precisa mudar antes da escala?</h2><p>Cada mudança resolve uma fragilidade e introduz uma nova condição operacional.</p></div><div className="redesign-grid">{redesignOptions.map((option) => <button key={option.id} className={redesign.includes(option.id) ? "selected" : ""} onClick={() => toggleRedesign(option.id)}><span>{redesign.includes(option.id) ? "✓" : "+"}</span><b>{option.label}</b><dl><dt>RESOLVE</dt><dd>{option.resolves}</dd><dt>INTRODUZ</dt><dd>{option.creates}</dd></dl></button>)}</div></section>}
        </section>
      </div>
    </main>
  );
}
