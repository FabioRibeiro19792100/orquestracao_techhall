"use client";

import { useMemo, useState } from "react";

type Phase = "lobby" | "learn" | "hypothesis" | "investigate" | "contain" | "consequence" | "redesign" | "debrief";
type PersonId = "ana" | "bruno" | "carla" | "diego";
type View = "people" | "shared" | "system" | "evidence";

const people: Record<PersonId, { name: string; initials: string; responsibility: string; mandate: string; question: string; constraint: string }> = {
  ana: { name: "Ana", initials: "AN", responsibility: "Autoridade e exposição", mandate: "Verificar qual política autorizou a ação e quem aceita o risco residual.", question: "A regra transformou uma ausência de informação em confirmação negativa?", constraint: "Uma liberação excepcional exige autoridade identificada e justificativa registrada." },
  bruno: { name: "Bruno", initials: "BR", responsibility: "Viabilidade técnica", mandate: "Entender componentes, ferramentas, dados, estado, timeout e fallback.", question: "O agente consultou a fonte original ou uma cópia?", constraint: "A autenticação não pode entrar automaticamente na decisão porque o fluxo não recebe esse sinal." },
  carla: { name: "Carla", initials: "CA", responsibility: "Capacidade operacional", mandate: "Avaliar prazo, fila humana, execução e possibilidade de reversão.", question: "A intervenção humana acontece antes ou depois de o prazo expirar?", constraint: "A revisão manual leva 40 minutos; restam 18. O fallback humano não é executável a tempo." },
  diego: { name: "Diego", initials: "DI", responsibility: "Qualidade da decisão", mandate: "Avaliar se as evidências justificam uma ação de alta consequência.", question: "O score de fraude é suficiente para reter sem considerar autenticação?", constraint: "O score de 0,87 é um sinal de risco, não uma autorização para movimentar dinheiro." },
};
const ids = Object.keys(people) as PersonId[];

const components = [
  { id: "flow", name: "Componente coordenador", technical: "Workflow de orquestração", plain: "Chama cada etapa, espera respostas, guarda o andamento e define como o processo continua.", config: "Timeout de 30 segundos; uma nova tentativa; fallback mantém a retenção.", why: "Ele guardou o resultado final, mas não preservou a resposta completa das ferramentas.", change: "Guardar tudo melhora auditoria, mas aumenta custo e retenção de dados." },
  { id: "model", name: "Cálculo de risco", technical: "Modelo FraudScore 4.7", plain: "Estima a probabilidade de fraude usando sinais da transferência.", config: "Score deste caso: 0,87. Não consulta viagem nem autenticação.", why: "O modelo pode ter calculado corretamente os sinais recebidos. Isso não explica sozinho a retenção.", change: "Aumentar o limiar reduz falsos positivos, mas permite mais fraudes." },
  { id: "agent", name: "Busca de contexto", technical: "Context Agent 0.9", plain: "Recebe uma tarefa, escolhe consultas permitidas e organiza uma recomendação.", config: "Modelo Atlas Small; temperatura 0,1; até 3 consultas; timeout de 2 segundos; sem memória.", why: "O agente só conhece o que suas ferramentas retornam. Ele não consulta qualquer sistema livremente.", change: "Mais consultas ampliam investigação, mas aumentam custo, tempo e variação." },
  { id: "tool", name: "Consulta de viagem", technical: "Ferramenta consultar_viagem", plain: "Permite ao agente procurar se o cliente informou uma viagem.", config: "Consulta uma cópia do CRM atualizada a cada seis horas.", why: "A viagem estava no CRM original, mas ainda não havia chegado à cópia.", change: "Consultar o CRM original reduz defasagem, mas cria dependência e adiciona latência." },
  { id: "rule", name: "Política automatizada", technical: "Rules Engine · regra R-17", plain: "Transforma as análises em uma ação permitida pela política do banco.", config: "Se score > 0,82 e viagem não encontrada, então reter.", why: "A regra confunde informação não encontrada com evento inexistente.", change: "Criar um terceiro estado reduz falsas conclusões, mas exige novos caminhos de teste." },
  { id: "execute", name: "Execução no dinheiro", technical: "Payment API · svc-payment-risk", plain: "É o sistema que efetivamente libera ou retém a transferência.", config: "A conta técnica pode reter até R$ 500 mil sem aprovação adicional.", why: "Conseguir executar tecnicamente não significa possuir autoridade adequada em todas as situações.", change: "Reduzir a permissão limita exposição, mas cria mais etapas de aprovação." },
  { id: "human", name: "Tratamento de exceções", technical: "Fila humana", plain: "Equipe que recebe situações não concluídas automaticamente.", config: "Mediana real de 40 minutos; capacidade de 11 casos por hora.", why: "Uma pessoa não é um controle efetivo quando não consegue agir dentro do prazo.", change: "Priorizar alto valor reduz espera desses casos, mas atrasa os demais." },
] as const;

const evidence = [
  { id: "agent-log", title: "Registro do agente", raw: "consultar_viagem → não encontrada · 14:03:11", meaning: "O agente procurou a viagem e recebeu uma resposta negativa da ferramenta. Isso ainda não prova que a viagem não existia." },
  { id: "replica", title: "Atualização dos dados", raw: "Réplica CRM: última carga 12:00 · próxima 18:00", meaning: "A viagem foi informada depois da última atualização. O agente trabalhou com uma cópia desatualizada." },
  { id: "rule", title: "Regra aplicada", raw: "R-17 v3: score > 0,82 + viagem ausente → reter", meaning: "A política não diferencia dado indisponível de viagem inexistente e ignora autenticação adicional." },
  { id: "queue", title: "Situação da fila humana", raw: "23 aguardando · mediana 40 min · prazo restante 18 min", meaning: "O human in the loop existe no desenho, mas não consegue funcionar como controle neste incidente." },
  { id: "auth", title: "Registro da autenticação", raw: "Concluída 14:02:49 · sistema Identity Hub", meaning: "O sinal existia antes da retenção, mas o agente e a regra não consultam esse sistema." },
] as const;

const phases: { id: Phase; label: string }[] = [
  { id: "lobby", label: "Sala" }, { id: "learn", label: "Compreender" }, { id: "hypothesis", label: "Hipóteses" }, { id: "investigate", label: "Investigar" },
  { id: "contain", label: "Conter" }, { id: "consequence", label: "Consequência" }, { id: "redesign", label: "Redesenhar" }, { id: "debrief", label: "Debrief" },
];

export default function Home() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [view, setView] = useState<View>("people");
  const [selected, setSelected] = useState<PersonId>("ana");
  const [openedComponents, setOpenedComponents] = useState<string[]>([]);
  const [explaining, setExplaining] = useState<typeof components[number] | null>(null);
  const [hypotheses, setHypotheses] = useState<PersonId[]>([]);
  const [openedEvidence, setOpenedEvidence] = useState<string[]>([]);
  const [constraints, setConstraints] = useState<PersonId[]>([]);
  const [decision, setDecision] = useState<"hold" | "release" | "pause" | null>(null);
  const [changes, setChanges] = useState<string[]>([]);

  const phaseIndex = phases.findIndex((p) => p.id === phase);
  const current = people[selected];
  const condition = useMemo(() => {
    if (phase === "lobby") return { progress: "4 pessoas conectadas", ready: true, need: "O facilitador pode iniciar." };
    if (phase === "learn") return { progress: `${openedComponents.length}/7 componentes abertos`, ready: openedComponents.length >= 4, need: "A turma precisa abrir pelo menos quatro componentes técnicos." };
    if (phase === "hypothesis") return { progress: `${hypotheses.length}/4 hipóteses registradas`, ready: hypotheses.length === 4, need: "Cada participante registra uma hipótese inicial." };
    if (phase === "investigate") return { progress: `${openedEvidence.length}/4 evidências consultadas`, ready: openedEvidence.length >= 4, need: "A mesa escolhe quatro evidências." };
    if (phase === "contain") return { progress: `${constraints.length}/4 restrições · ${decision ? "decisão escolhida" : "sem decisão"}`, ready: constraints.length === 4 && !!decision, need: "Todos declaram sua restrição e a mesa escolhe uma contenção." };
    if (phase === "consequence") return { progress: "Consequência revelada", ready: true, need: "A turma interpreta o resultado antes de redesenhar." };
    if (phase === "redesign") return { progress: `${changes.length} alterações escolhidas`, ready: changes.length >= 2, need: "A mesa escolhe pelo menos duas alterações e assume seus trade-offs." };
    return { progress: "Percurso concluído", ready: false, need: "Compare hipóteses, evidências, decisão e novo desenho." };
  }, [phase, openedComponents, hypotheses, openedEvidence, constraints, decision, changes]);

  function advance() {
    if (!condition.ready || phase === "debrief") return;
    const next = phases[Math.min(phaseIndex + 1, phases.length - 1)].id;
    setPhase(next);
    if (next === "learn" || next === "redesign") setView("system");
    else if (next === "investigate") setView("evidence");
    else if (next === "contain" || next === "consequence" || next === "debrief") setView("shared");
    else setView("people");
  }

  function openComponent(item: typeof components[number]) {
    setExplaining(item);
    if (!openedComponents.includes(item.id)) setOpenedComponents([...openedComponents, item.id]);
  }

  function toggleChange(id: string) { setChanges(changes.includes(id) ? changes.filter((x) => x !== id) : [...changes, id]); }

  return <main className="lab-app">
    <header className="app-header"><div className="app-brand"><span>O</span><b>ORQUESTRA LAB</b></div><div><strong>Sessão ORQ-241</strong><small>Piloto antifraude · dia 17</small></div><span className="live">● AO VIVO</span></header>
    <div className="app-shell">
      <aside className="facilitator-sidebar"><small>FACILITADOR</small><h1>{phases[phaseIndex].label}</h1><div className="phase-summary"><b>Para que serve esta etapa</b><p>{condition.need}</p></div><div className="progress"><div><span>Estado atual</span><b>{condition.progress}</b></div><i><em style={{ width: condition.ready ? "100%" : "45%" }} /></i></div><button className="advance" disabled={!condition.ready} onClick={advance}>{phase === "lobby" ? "Iniciar a experiência" : phase === "debrief" ? "Experiência concluída" : `Avançar para ${phases[Math.min(phaseIndex + 1, phases.length - 1)].label}`}<span>→</span></button><div className="round-list"><small>PERCURSO</small>{phases.map((item, index) => <div className={phase === item.id ? "current" : index < phaseIndex ? "done" : ""} key={item.id}><span>{index < phaseIndex ? "✓" : index + 1}</span>{item.label}</div>)}</div></aside>
      <section className="facilitator-main"><nav className="main-tabs"><button className={view === "people" ? "active" : ""} onClick={() => setView("people")}>Participantes</button><button className={view === "shared" ? "active" : ""} onClick={() => setView("shared")}>Tela da mesa</button><button className={view === "system" ? "active" : ""} onClick={() => setView("system")}>Sistema técnico</button><button className={view === "evidence" ? "active" : ""} onClick={() => setView("evidence")}>Evidências</button></nav>

        {view === "people" && <div className="people-workspace"><section className="people-list"><header><div><small>PESSOAS CONECTADAS</small><h2>Abra o celular de cada participante</h2></div><b>4 online</b></header>{ids.map((id) => <button className={selected === id ? "selected" : ""} onClick={() => setSelected(id)} key={id}><span className="person-avatar">{people[id].initials}</span><div><b>{people[id].name}</b><p>{people[id].responsibility}</p></div><em>{(phase === "hypothesis" && hypotheses.includes(id)) || (phase === "contain" && constraints.includes(id)) ? "Concluiu" : "Ver tela"}</em><i>→</i></button>)}</section><section className="phone-area"><div className="phone-label"><small>VISÃO EXATA DO PARTICIPANTE</small><h2>Celular de {current.name}</h2></div><div className="phone"><div className="phone-top"><span>9:41</span><i /></div><header><span className="tiny-brand">ORQUESTRA</span><b>{current.name}</b></header><div className="phone-content">
          {phase === "lobby" && <><span className="mobile-step">SALA DE ESPERA</span><h2>Você está conectado.</h2><p>Sua responsabilidade nesta sessão será:</p><div className="mobile-responsibility"><small>RESPONSABILIDADE</small><b>{current.responsibility}</b><p>{current.mandate}</p></div><div className="mobile-wait">Aguardando o facilitador iniciar…</div></>}
          {phase === "learn" && <><span className="mobile-step">COMPREENDER O SISTEMA</span><h2>Explore antes do incidente.</h2><p>Abra “Sistema técnico” para entender como a operação foi montada. Você pode tocar em “Entender” sempre que encontrar um termo técnico.</p><div className="mobile-responsibility"><small>SUA LENTE</small><p>{current.mandate}</p></div></>}
          {phase === "hypothesis" && <><span className="mobile-step">HIPÓTESE INDIVIDUAL</span><h2>Onde você procuraria primeiro?</h2><p>{current.question}</p><textarea aria-label="Hipótese" defaultValue={`Minha hipótese: precisamos investigar ${current.responsibility.toLowerCase()} antes de decidir.`} /><button disabled={hypotheses.includes(selected)} onClick={() => setHypotheses([...hypotheses, selected])}>{hypotheses.includes(selected) ? "✓ Hipótese registrada" : "Registrar minha hipótese"}</button></>}
          {phase === "investigate" && <><span className="mobile-step">INVESTIGAÇÃO DA MESA</span><h2>Escolham evidências, não respostas.</h2><p>A tela da mesa mostra o que já foi consultado. As evidências podem confirmar ou contrariar sua hipótese.</p><div className="mobile-wait">{openedEvidence.length} de 4 consultas realizadas</div></>}
          {phase === "contain" && <><span className="mobile-step">CONTENÇÃO</span><h2>Declare sua restrição.</h2><div className="private-info"><small>O QUE SUA RESPONSABILIDADE EXIGE</small><p>{current.constraint}</p></div><button disabled={constraints.includes(selected)} onClick={() => setConstraints([...constraints, selected])}>{constraints.includes(selected) ? "✓ Restrição na mesa" : "Levar esta restrição à mesa"}</button></>}
          {(phase === "consequence" || phase === "redesign" || phase === "debrief") && <><span className="mobile-step">RESULTADO COMPARTILHADO</span><h2>A arquitetura produziu uma consequência.</h2><div className="mobile-feedback"><b>Decisão da mesa</b><p>{decision === "release" ? "Liberar por exceção: preserva a operação e exige responsável pela exposição." : decision === "pause" ? "Suspender automação: contém falsos positivos e pressiona a operação humana." : "Manter retenção: contém o risco e faz a transferência perder o prazo."}</p></div></>}
        </div><footer>ORQ-241 · {phases[phaseIndex].label}</footer></div></section></div>}

        {view === "system" && <section className="technical-system"><header><small>DOSSIÊ DO PILOTO</small><h1>Como esta operação foi montada</h1><p>Clique em “Entender” para abrir a função, a configuração e o impacto de cada componente.</p></header><div className="system-chain">{components.map((item, i) => <div className="system-item" key={item.id}><article><span>{i + 1}</span><h2>{item.name}</h2><p>{item.plain}</p><small>{item.technical}</small><button onClick={() => openComponent(item)}>Entender este componente</button></article>{i < components.length - 1 && <i>→</i>}</div>)}</div>{phase === "redesign" && <div className="redesign-panel"><small>ALTERAÇÕES PROPOSTAS</small><h2>Escolham mudanças e assumam as novas condições</h2>{components.filter((c) => ["tool", "rule", "flow", "human"].includes(c.id)).map((item) => <button className={changes.includes(item.id) ? "selected" : ""} onClick={() => toggleChange(item.id)} key={item.id}><span>{changes.includes(item.id) ? "✓" : "+"}</span><div><b>Alterar: {item.name}</b><p>{item.change}</p></div></button>)}</div>}</section>}

        {explaining && <div className="explain-backdrop" onClick={() => setExplaining(null)}><article className="explain-drawer" onClick={(e) => e.stopPropagation()}><button className="close" onClick={() => setExplaining(null)}>×</button><small>EXPLICAÇÃO TÉCNICA</small><h1>{explaining.name}</h1><span className="technical-name">Nome técnico: {explaining.technical}</span><section><h3>O que é?</h3><p>{explaining.plain}</p></section><section><h3>Como está configurado aqui?</h3><p>{explaining.config}</p></section><section><h3>Por que importa neste incidente?</h3><p>{explaining.why}</p></section><section><h3>O que muda se alterarmos?</h3><p>{explaining.change}</p></section>{explaining.id === "agent" && <section className="parameter"><h3>Entendendo “temperatura 0,1”</h3><p>Temperatura controla quanto uma resposta pode variar. Um valor baixo favorece consistência. Não significa “10% de criatividade” nem “90% de certeza”. Aqui foi escolhido 0,1 porque a tarefa exige repetibilidade, não variedade.</p></section>}</article></div>}

        {view === "evidence" && <section className="evidence-room"><header><small>INVESTIGAÇÃO</small><h1>Que evidência ajuda a explicar a retenção?</h1><p>A mesa pode abrir quatro de cinco evidências. Cada consulta devolve o registro bruto e sua interpretação.</p></header><div className="evidence-list">{evidence.map((item) => { const isOpen = openedEvidence.includes(item.id); return <button key={item.id} className={isOpen ? "open" : ""} disabled={!isOpen && openedEvidence.length >= 4} onClick={() => !isOpen && setOpenedEvidence([...openedEvidence, item.id])}><span>{isOpen ? "✓" : "+"}</span><div><h2>{item.title}</h2>{isOpen ? <><code>{item.raw}</code><p><b>O que isso significa:</b> {item.meaning}</p></> : <p>Abrir esta evidência</p>}</div></button>})}</div></section>}

        {view === "shared" && <section className="shared-screen"><header><small>TELA DA MESA</small><h1>Transferência de R$ 180 mil retida</h1><p>O cliente contesta. Restam 18 minutos e a revisão humana leva aproximadamente 40.</p></header>{phase === "contain" && <><div className="shared-contributions"><small>RESTRIÇÕES DECLARADAS</small>{constraints.map((id) => <article key={id}><b>{people[id].responsibility}</b><p>{people[id].constraint}</p></article>)}</div><div className="table-decision"><small>DECISÃO DE CONTENÇÃO</small><h2>O que fazer com este incidente?</h2><div><button className={decision === "hold" ? "selected" : ""} onClick={() => setDecision("hold")}>Manter retenção</button><button className={decision === "release" ? "selected" : ""} onClick={() => setDecision("release")}>Liberar por exceção</button><button className={decision === "pause" ? "selected" : ""} onClick={() => setDecision("pause")}>Suspender automação</button></div></div></>}{(phase === "consequence" || phase === "redesign" || phase === "debrief") && <div className="collective-result"><small>CONSEQUÊNCIA</small><h2>{decision === "release" ? "A operação foi preservada e a exposição foi transferida" : decision === "pause" ? "A automação foi contida e a operação ficou sobrecarregada" : "O risco imediato foi contido e o prazo foi perdido"}</h2><p>{decision === "release" ? "A transferência foi concluída. A organização precisa identificar quem autorizou a exceção, quais evidências sustentaram a decisão e como monitorará o risco residual." : decision === "pause" ? "Novas retenções automáticas pararam. A fila humana ultrapassa a capacidade em menos de uma hora e exige priorização ou redução do escopo." : "A transferência permanece retida. A revisão humana acontecerá depois do vencimento, produzindo impacto ao cliente mesmo sem confirmação de fraude."}</p></div>}{phase === "debrief" && <div className="debrief-grid"><article><small>ANTES</small><h3>Hipóteses</h3><p>{hypotheses.length} participantes registraram leituras individuais.</p></article><article><small>INVESTIGAÇÃO</small><h3>Evidências</h3><p>{openedEvidence.length} registros foram consultados.</p></article><article><small>DECISÃO</small><h3>Contenção</h3><p>{decision === "release" ? "Liberação excepcional" : decision === "pause" ? "Suspensão da automação" : "Retenção mantida"}</p></article><article><small>FUTURO</small><h3>Redesenho</h3><p>{changes.length} componentes foram alterados.</p></article></div>}</section>}
      </section>
    </div>
  </main>;
}
