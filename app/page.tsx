"use client";

import { useState } from "react";

const lessons = [
  {
    tab: "1. Entender a operação",
    title: "Antes da tecnologia, qual decisão esta operação precisa produzir?",
    say: "Uma transferência não é simplesmente aprovada por uma IA. O banco reúne informações, interpreta o risco, aplica suas regras e executa uma ação.",
    ask: "Que decisões precisam acontecer entre o pedido do cliente e a movimentação do dinheiro?",
    advance: "Avance depois que a turma distinguir análise, decisão e execução.",
  },
  {
    tab: "2. Ver a arquitetura",
    title: "Como o banco implementou essa operação",
    say: "Agora vamos ligar cada etapa do processo a um componente técnico. O importante não é decorar nomes, mas entender a função de cada parte.",
    ask: "Qual componente interpreta? Qual coordena? Qual autoriza? Qual executa?",
    advance: "Avance quando a turma conseguir narrar o fluxo da esquerda para a direita.",
  },
  {
    tab: "3. Abrir o agente",
    title: "O agente tem um objetivo, ferramentas e limites",
    say: "O agente de contexto não sabe tudo e não movimenta dinheiro. Ele recebe um objetivo e pode usar somente as ferramentas que foram disponibilizadas.",
    ask: "O que esse agente consegue fazer? E o que ele não consegue fazer?",
    advance: "Avance quando estiver clara a diferença entre agente, ferramenta e sistema conectado.",
  },
  {
    tab: "4. Separar poderes",
    title: "Recomendar, autorizar e executar são ações diferentes",
    say: "O agente recomenda. A regra do banco autoriza uma ação. Uma identidade técnica executa essa ação no sistema de pagamentos.",
    ask: "Se a retenção foi inadequada, em qual dessas três camadas devemos procurar a causa?",
    advance: "Avance depois de mostrar que o resultado pertence à cadeia completa.",
  },
  {
    tab: "5. Simular o incidente",
    title: "Agora a turma usa a arquitetura para explicar o que aconteceu",
    say: "O piloto está no dia 17. Uma transferência foi retida, o cliente contestou e o tratamento humano não responderá dentro do prazo.",
    ask: "Que evidência precisamos consultar antes de decidir o que fazer?",
    advance: "A simulação avança quando a mesa consulta três evidências e toma uma decisão de contenção.",
  },
  {
    tab: "6. Voltar ao desenho",
    title: "O que precisa mudar antes de ampliar o piloto?",
    say: "Voltamos ao mesmo diagrama. Agora destacamos o ponto de falha e avaliamos como cada alteração resolve um problema e cria uma nova condição.",
    ask: "Que mudança é necessária, quem precisa aprová-la e que novo risco ela introduz?",
    advance: "Encerre quando a mesa conseguir explicar o novo desenho e a exposição que decidiu aceitar.",
  },
];

const evidences = [
  { id: "log", label: "Ver o que o agente consultou", answer: "O agente consultou uma cópia do CRM atualizada a cada seis horas. A viagem havia sido informada 20 minutos antes." },
  { id: "rule", label: "Ver qual regra foi aplicada", answer: "A regra R-17 retém transferências com score acima de 0,82 quando uma viagem não é encontrada." },
  { id: "queue", label: "Ver a fila humana", answer: "A revisão levará aproximadamente 40 minutos. Restam 18 minutos para concluir a transferência." },
  { id: "auth", label: "Ver a autenticação", answer: "A autenticação foi concluída, mas seu resultado está em um sistema que o agente não consulta." },
];

const decisions = [
  { id: "hold", title: "Manter a retenção", result: "A transferência perde o prazo antes da revisão humana." },
  { id: "release", title: "Liberar por exceção", result: "A operação é concluída, mas alguém precisa aceitar e registrar a exposição residual." },
  { id: "pause", title: "Suspender a automação", result: "Novas retenções deixam de acontecer, mas a fila manual cresce além da capacidade disponível." },
];

function BusinessFlow({ technical = false, highlight = false }: { technical?: boolean; highlight?: boolean }) {
  const steps = technical
    ? [
        ["1", "Orquestrador", "Coordena a sequência e guarda o estado"],
        ["2", "Modelo de fraude", "Produz um score de risco"],
        ["3", "Agente de contexto", "Procura informações usando ferramentas"],
        ["4", "Motor de regras", "Determina qual ação está autorizada"],
        ["5", "API de pagamentos", "Executa a retenção ou a liberação"],
        ["6", "Fila humana", "Trata situações que o fluxo não resolve"],
      ]
    : [
        ["1", "Receber", "O cliente solicita a transferência"],
        ["2", "Analisar", "O banco avalia risco e contexto"],
        ["3", "Decidir", "Uma regra escolhe o caminho permitido"],
        ["4", "Executar", "O dinheiro é liberado ou retido"],
        ["5", "Tratar exceção", "Uma pessoa entra quando necessário"],
      ];
  return <div className={`plain-flow ${technical ? "technical" : ""}`}>
    {steps.map((step, index) => <div className="flow-wrap" key={step[1]}><article className={highlight && step[1] === "Agente de contexto" ? "highlight" : ""}><span>{step[0]}</span><div><b>{step[1]}</b><p>{step[2]}</p></div></article>{index < steps.length - 1 && <i>→</i>}</div>)}
  </div>;
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [opened, setOpened] = useState<string[]>([]);
  const [decision, setDecision] = useState<string | null>(null);
  const [participantView, setParticipantView] = useState(false);
  const lesson = lessons[step];
  const currentResult = decisions.find((item) => item.id === decision)?.result;

  function next() { setStep((value) => Math.min(lessons.length - 1, value + 1)); }
  function previous() { setStep((value) => Math.max(0, value - 1)); }

  return <main>
    <header className="topbar">
      <div className="brand"><span className="brand-mark">O</span><span>ORQUESTRA</span><small>LAB</small></div>
      <div className="session-meta">AULA GUIADA · PILOTO DE PREVENÇÃO A FRAUDES</div>
      <button className="view-participant" onClick={() => setParticipantView(!participantView)}>{participantView ? "Voltar ao facilitador" : "Ver tela da turma"}</button>
    </header>

    <nav className="lesson-nav">{lessons.map((item, index) => <button key={item.tab} className={`${index === step ? "active" : ""} ${index < step ? "done" : ""}`} onClick={() => setStep(index)}><span>{index < step ? "✓" : index + 1}</span>{item.tab.replace(/^\d\. /, "")}</button>)}</nav>

    <div className={`lesson-layout ${participantView ? "participant-only" : ""}`}>
      {!participantView && <aside className="facilitator-guide">
        <div className="guide-title"><small>SEU ROTEIRO</small><h2>{lesson.tab}</h2></div>
        <section className="guide-now"><small>AGORA, EXPLIQUE</small><p>{lesson.say}</p></section>
        <section><small>PERGUNTE À TURMA</small><blockquote>“{lesson.ask}”</blockquote></section>
        <section><small>QUANDO AVANÇAR</small><p>{lesson.advance}</p></section>
        <div className="guide-actions"><button onClick={previous} disabled={step === 0}>← Voltar</button><button className="next" onClick={next} disabled={step === lessons.length - 1}>Avançar explicação →</button></div>
      </aside>}

      <section className="projected-screen">
        <div className="projected-label"><span>TELA PROJETADA PARA A TURMA</span><b>{step + 1} de {lessons.length}</b></div>
        <header className="lesson-heading"><small>{lesson.tab.toUpperCase()}</small><h1>{lesson.title}</h1></header>

        {step === 0 && <section className="lesson-card">
          <div className="business-case"><span>O PEDIDO</span><h2>Um cliente solicita uma transferência de R$ 180 mil.</h2><p>Entre o pedido e a movimentação do dinheiro, a organização precisa produzir uma decisão.</p></div>
          <BusinessFlow />
          <div className="takeaway"><b>Ideia central</b><span>Primeiro entendemos a decisão. Depois observamos como a tecnologia a produz.</span></div>
        </section>}

        {step === 1 && <section className="lesson-card">
          <div className="simple-intro"><p>O mesmo processo, agora visto como uma arquitetura técnica.</p><span>Clique em cada etapa durante sua explicação.</span></div>
          <BusinessFlow technical />
          <div className="plain-definition"><b>O que é orquestração aqui?</b><p>É a coordenação dessas partes para que uma solicitação atravesse análises, regras, sistemas e exceções até produzir um resultado.</p></div>
        </section>}

        {step === 2 && <section className="lesson-card agent-lesson">
          <BusinessFlow technical highlight />
          <div className="agent-open"><div><small>COMPONENTE ABERTO</small><h2>Agente de contexto</h2><p>Procura informações que ajudem a interpretar se a transferência faz sentido.</p></div><div className="agent-columns"><article><small>RECEBE</small><b>Um objetivo</b><p>“Procure sinais que tornem esta transferência plausível.”</p></article><article><small>PODE USAR</small><b>Duas ferramentas</b><p>Consultar viagem e consultar histórico.</p></article><article><small>NÃO PODE</small><b>Movimentar dinheiro</b><p>Não libera, não retém e não altera regras.</p></article></div></div>
          <div className="takeaway"><b>Agente não é autonomia irrestrita</b><span>Sua capacidade depende do objetivo, das ferramentas e das permissões concedidas.</span></div>
        </section>}

        {step === 3 && <section className="lesson-card authority-lesson">
          <div className="authority-chain"><article><span>1</span><small>AGENTE DE CONTEXTO</small><h2>Recomenda</h2><p>Interpreta as informações disponíveis e propõe um caminho.</p></article><i>→</i><article><span>2</span><small>MOTOR DE REGRAS</small><h2>Autoriza</h2><p>Aplica a política aprovada pelo banco.</p></article><i>→</i><article><span>3</span><small>CONTA TÉCNICA</small><h2>Executa</h2><p>Altera o estado real da transferência.</p></article></div>
          <div className="plain-definition"><b>Por que separar?</b><p>Porque uma recomendação pode estar adequada aos dados recebidos, enquanto a regra está desatualizada ou a permissão de execução é ampla demais.</p></div>
        </section>}

        {step === 4 && <section className="lesson-card simulation">
          <div className="incident"><div><small>INCIDENTE · DIA 17 DO PILOTO</small><h2>A transferência foi retida. O cliente contesta.</h2><p>Restam 18 minutos. A revisão humana costuma levar 40 minutos.</p></div><div><span>Score de fraude</span><b>87%</b></div></div>
          <div className="simulation-status"><article><small>O QUE FAZER AGORA</small><b>Escolham três evidências antes de decidir.</b></article><article><small>QUANDO HÁ FEEDBACK</small><b>Imediatamente após cada consulta e após a decisão.</b></article><article><small>QUANDO AVANÇA</small><b>Depois de três consultas e uma decisão da mesa.</b></article></div>
          <div className="evidence-grid">{evidences.map((item) => <button key={item.id} className={opened.includes(item.id) ? "opened" : ""} disabled={opened.includes(item.id) || opened.length >= 3} onClick={() => setOpened([...opened, item.id])}><span>{opened.includes(item.id) ? "✓" : "+"}</span><b>{item.label}</b>{opened.includes(item.id) && <p>{item.answer}</p>}</button>)}</div>
          {opened.length >= 3 && <div className="decision-area"><small>DECISÃO DA MESA</small><h2>O que fazer com esta transferência?</h2><div>{decisions.map((item) => <button key={item.id} className={decision === item.id ? "selected" : ""} onClick={() => setDecision(item.id)}>{item.title}</button>)}</div>{currentResult && <aside><b>Feedback para todos</b><p>{currentResult}</p></aside>}</div>}
        </section>}

        {step === 5 && <section className="lesson-card consolidation">
          <BusinessFlow technical highlight />
          <div className="before-after"><article><small>O QUE ACONTECEU</small><h2>O agente consultou uma cópia desatualizada.</h2><p>A viagem existia no CRM, mas ainda não estava disponível para a ferramenta.</p></article><article><small>MUDANÇA PROPOSTA</small><h2>Consultar o CRM original em casos de alto valor.</h2><p>Resolve a defasagem, mas transforma o CRM em dependência crítica e adiciona latência.</p></article></div>
          <div className="takeaway"><b>Aprendizado</b><span>Redesenhar uma parte altera condições em outras partes. Orquestrar é administrar essas dependências.</span></div>
        </section>}
      </section>
    </div>
  </main>;
}
