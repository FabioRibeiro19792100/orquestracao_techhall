"use client";

import { useMemo, useState } from "react";

type Phase = "lobby" | "reading" | "sharing" | "decision" | "feedback";
type PersonId = "ana" | "bruno" | "carla" | "diego";

const people: Record<PersonId, { name: string; initials: string; responsibility: string; privateInfo: string; contribution: string }> = {
  ana: { name: "Ana", initials: "AN", responsibility: "Risco", privateInfo: "A regra que reteve a transferência foi criada antes da entrada do agente de contexto.", contribution: "A regra R-17 não considera autenticação adicional. Ela apenas combina o score de fraude e a existência de viagem." },
  bruno: { name: "Bruno", initials: "BR", responsibility: "Tecnologia", privateInfo: "O agente não consulta o CRM original. Ele consulta uma cópia atualizada a cada seis horas.", contribution: "A viagem pode existir no CRM e ainda não estar disponível para o agente. Uma consulta direta levaria cerca de 900 milissegundos." },
  carla: { name: "Carla", initials: "CA", responsibility: "Operação", privateInfo: "A revisão humana leva cerca de 40 minutos. A transferência perde o prazo em 18 minutos.", contribution: "A fila humana não resolve este caso a tempo. Hoje ela tem 23 casos aguardando análise." },
  diego: { name: "Diego", initials: "DI", responsibility: "Negócio", privateInfo: "O cliente concluiu uma autenticação adicional e precisa pagar um fornecedor ainda hoje.", contribution: "Manter a retenção faz a operação perder o prazo. Liberar preserva o pagamento, mas mantém uma exposição de fraude." },
};

const order: PersonId[] = ["ana", "bruno", "carla", "diego"];
const phaseLabels: Record<Phase, string> = { lobby: "Sala de espera", reading: "Leitura individual", sharing: "Compartilhar informações", decision: "Decisão da mesa", feedback: "Consequência" };

export default function Home() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [selected, setSelected] = useState<PersonId>("ana");
  const [ready, setReady] = useState<PersonId[]>([]);
  const [shared, setShared] = useState<PersonId[]>([]);
  const [decision, setDecision] = useState<"hold" | "release" | "pause" | null>(null);
  const [mainView, setMainView] = useState<"people" | "shared" | "architecture">("people");

  const doneCount = phase === "reading" ? ready.length : phase === "sharing" ? shared.length : 0;
  const canAdvance = phase === "lobby" || (phase === "reading" && ready.length === 4) || (phase === "sharing" && shared.length === 4) || (phase === "decision" && !!decision);
  const nextLabel = phase === "lobby" ? "Iniciar sessão" : phase === "reading" ? "Abrir compartilhamento" : phase === "sharing" ? "Abrir decisão" : phase === "decision" ? "Mostrar consequência" : "Sessão concluída";
  const statusText = useMemo(() => {
    if (phase === "lobby") return "As quatro pessoas estão conectadas. A sessão ainda não começou.";
    if (phase === "reading") return `${ready.length} de 4 participantes terminaram a leitura.`;
    if (phase === "sharing") return `${shared.length} de 4 informações foram compartilhadas.`;
    if (phase === "decision") return decision ? "A mesa escolheu uma decisão. Você já pode revelar a consequência." : "A mesa ainda precisa escolher uma decisão.";
    return "A consequência está visível para todos.";
  }, [phase, ready, shared, decision]);

  function advance() {
    if (!canAdvance || phase === "feedback") return;
    const next: Record<Exclude<Phase, "feedback">, Phase> = { lobby: "reading", reading: "sharing", sharing: "decision", decision: "feedback" };
    setPhase(next[phase]);
    setMainView(phase === "sharing" ? "shared" : "people");
  }

  function actAs(person: PersonId) {
    if (phase === "reading" && !ready.includes(person)) setReady([...ready, person]);
    if (phase === "sharing" && !shared.includes(person)) setShared([...shared, person]);
  }

  const current = people[selected];

  return <main className="lab-app">
    <header className="app-header"><div className="app-brand"><span>O</span><b>ORQUESTRA LAB</b></div><div><strong>Sessão ORQ-241</strong><small>Piloto de prevenção a fraudes</small></div><span className="live">● AO VIVO</span></header>

    <div className="app-shell">
      <aside className="facilitator-sidebar">
        <small>PAINEL DO FACILITADOR</small><h1>{phaseLabels[phase]}</h1>
        <div className="phase-summary"><b>O que está acontecendo agora</b><p>{statusText}</p></div>
        {phase !== "lobby" && phase !== "feedback" && <div className="progress"><div><span>Progresso da rodada</span><b>{phase === "decision" ? (decision ? "1/1" : "0/1") : `${doneCount}/4`}</b></div><i><em style={{ width: phase === "decision" ? (decision ? "100%" : "0%") : `${doneCount * 25}%` }} /></i></div>}
        <button className="advance" disabled={!canAdvance || phase === "feedback"} onClick={advance}>{nextLabel}<span>→</span></button>
        {!canAdvance && <p className="waiting">O botão será liberado quando esta etapa estiver completa.</p>}
        <div className="round-list"><small>ETAPAS DA SESSÃO</small>{(["lobby", "reading", "sharing", "decision", "feedback"] as Phase[]).map((item, index) => <div className={phase === item ? "current" : ""} key={item}><span>{index + 1}</span>{phaseLabels[item]}</div>)}</div>
      </aside>

      <section className="facilitator-main">
        <nav className="main-tabs"><button className={mainView === "people" ? "active" : ""} onClick={() => setMainView("people")}>Participantes</button><button className={mainView === "shared" ? "active" : ""} onClick={() => setMainView("shared")}>Tela compartilhada</button><button className={mainView === "architecture" ? "active" : ""} onClick={() => setMainView("architecture")}>Como o piloto funciona</button></nav>

        {mainView === "people" && <div className="people-workspace">
          <section className="people-list"><header><div><small>PESSOAS CONECTADAS</small><h2>Escolha uma pessoa para ver seu celular</h2></div><b>4 online</b></header>{order.map((id) => { const person = people[id]; const completed = phase === "reading" ? ready.includes(id) : phase === "sharing" ? shared.includes(id) : false; return <button className={selected === id ? "selected" : ""} onClick={() => setSelected(id)} key={id}><span className="person-avatar">{person.initials}</span><div><b>{person.name}</b><p>{person.responsibility}</p></div><em>{phase === "lobby" ? "Conectado" : completed ? "Concluiu" : "Aguardando"}</em><i>Ver celular →</i></button>; })}</section>

          <section className="phone-area"><div className="phone-label"><small>VISÃO EXATA DO PARTICIPANTE</small><h2>Celular de {current.name}</h2></div><div className="phone"><div className="phone-top"><span>9:41</span><i /></div><header><span className="tiny-brand">ORQUESTRA</span><b>{current.name}</b></header><div className="phone-content">
            {phase === "lobby" && <><span className="mobile-step">SALA DE ESPERA</span><h2>Você está conectado.</h2><p>A atividade começará quando o facilitador iniciar a sessão.</p><div className="mobile-responsibility"><small>SUA RESPONSABILIDADE</small><b>{current.responsibility}</b></div><div className="mobile-wait">Aguardando o facilitador…</div></>}
            {phase === "reading" && <><span className="mobile-step">ETAPA 1 · LEITURA INDIVIDUAL</span><h2>Leia antes de conversar.</h2><p>Uma transferência de R$ 180 mil foi retida automaticamente. O cliente contesta e restam 18 minutos.</p><div className="private-info"><small>INFORMAÇÃO QUE SÓ VOCÊ RECEBEU</small><p>{current.privateInfo}</p></div><button disabled={ready.includes(selected)} onClick={() => actAs(selected)}>{ready.includes(selected) ? "✓ Leitura concluída" : "Terminei a leitura"}</button></>}
            {phase === "sharing" && <><span className="mobile-step">ETAPA 2 · COMPARTILHAMENTO</span><h2>Sua informação pode mudar a conversa.</h2><p>Explique esta informação com suas próprias palavras e depois registre o compartilhamento.</p><div className="private-info"><small>O QUE VOCÊ PODE COMPARTILHAR</small><p>{current.contribution}</p></div><button disabled={shared.includes(selected)} onClick={() => actAs(selected)}>{shared.includes(selected) ? "✓ Informação compartilhada" : "Compartilhei com a mesa"}</button>{shared.includes(selected) && <div className="mobile-feedback"><b>O que aconteceu</b><p>A informação apareceu na tela compartilhada e está disponível para todos.</p></div>}</>}
            {phase === "decision" && <><span className="mobile-step">ETAPA 3 · DECISÃO DA MESA</span><h2>Conversem antes de escolher.</h2><p>A decisão é coletiva. Ela será registrada na tela compartilhada, não neste celular.</p><div className="mobile-wait">Abra “Tela compartilhada” no painel do facilitador.</div></>}
            {phase === "feedback" && <><span className="mobile-step">ETAPA 4 · CONSEQUÊNCIA</span><h2>A decisão produziu um resultado.</h2><div className="mobile-feedback"><b>Feedback para todos</b><p>{decision === "release" ? "A transferência foi liberada por exceção. A operação foi preservada, mas a exposição residual precisa de responsável e registro." : decision === "pause" ? "A automação foi suspensa. Novas retenções param, mas a fila humana ultrapassa a capacidade em menos de uma hora." : "A retenção foi mantida. A revisão humana acontecerá depois que o prazo da transferência terminar."}</p></div></>}
          </div><footer>ORQ-241 · {phaseLabels[phase]}</footer></div></section>
        </div>}

        {mainView === "shared" && <section className="shared-screen"><header><small>TELA PROJETADA PARA TODOS</small><h1>{phase === "lobby" ? "A sessão começará em breve" : "Uma transferência de R$ 180 mil foi retida"}</h1><p>{phase === "lobby" ? "Quatro participantes conectados." : "O cliente contesta a decisão. Restam 18 minutos para concluir a operação."}</p></header>{phase === "sharing" || phase === "decision" || phase === "feedback" ? <div className="shared-contributions"><small>INFORMAÇÕES QUE A MESA JÁ COMPARTILHOU</small>{shared.length === 0 && <p>Nenhuma informação compartilhada ainda.</p>}{shared.map((id) => <article key={id}><b>{people[id].responsibility}</b><p>{people[id].contribution}</p></article>)}</div> : <div className="shared-wait"><b>Agora</b><p>Os participantes estão lendo informações diferentes em seus celulares.</p></div>}{phase === "decision" && <div className="table-decision"><small>DECISÃO COLETIVA</small><h2>O que fazer agora?</h2><div><button className={decision === "hold" ? "selected" : ""} onClick={() => setDecision("hold")}>Manter a retenção</button><button className={decision === "release" ? "selected" : ""} onClick={() => setDecision("release")}>Liberar por exceção</button><button className={decision === "pause" ? "selected" : ""} onClick={() => setDecision("pause")}>Suspender automação</button></div></div>}{phase === "feedback" && <div className="collective-result"><small>CONSEQUÊNCIA DA DECISÃO</small><h2>{decision === "release" ? "Operação preservada; exposição assumida" : decision === "pause" ? "Automação contida; operação pressionada" : "Risco contido; prazo perdido"}</h2><p>{decision === "release" ? "A transferência foi liberada por exceção. Agora a organização precisa registrar quem aceitou a exposição residual." : decision === "pause" ? "Novas retenções automáticas foram suspensas. A fila humana ultrapassará sua capacidade em menos de uma hora." : "A retenção permanece, mas a análise humana acontecerá depois do prazo da transferência."}</p></div>}</section>}

        {mainView === "architecture" && <section className="architecture-view"><header><small>COMO O PILOTO FUNCIONA</small><h1>Do pedido do cliente até a ação no sistema</h1><p>Este mapa usa primeiro linguagem comum. Os nomes técnicos aparecem como explicação, não como ponto de partida.</p></header><div className="architecture-flow"><article><span>1</span><h2>O pedido chega</h2><p>O cliente solicita uma transferência.</p><small>SISTEMA: aplicativo e API do banco</small></article><i>→</i><article><span>2</span><h2>O risco é analisado</h2><p>Um cálculo estima a chance de fraude.</p><small>NOME TÉCNICO: modelo de fraude</small></article><i>→</i><article><span>3</span><h2>O contexto é procurado</h2><p>Um componente consulta viagem e histórico.</p><small>NOME TÉCNICO: agente com ferramentas</small></article><i>→</i><article><span>4</span><h2>A política decide</h2><p>Uma regra determina o que está autorizado.</p><small>NOME TÉCNICO: motor de regras</small></article><i>→</i><article><span>5</span><h2>A ação acontece</h2><p>O dinheiro é liberado ou retido.</p><small>SISTEMA: API de pagamentos</small></article></div><div className="orchestration-explain"><b>Onde está a orquestração?</b><p>Um componente coordena essa sequência, guarda o que já aconteceu e define como o processo continua quando uma etapa falha. Ele pode ser código próprio, um motor de workflow ou uma plataforma.</p></div></section>}
      </section>
    </div>
  </main>;
}
