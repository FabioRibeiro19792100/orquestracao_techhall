# Modelo do simulador de operações multiagente

## 1. O que o produto simula

O produto simula a gestão de uma **operação contínua executada com agentes de IA**.

A unidade principal da experiência não é um caso individual. É um período operacional — por exemplo, 30 dias — com volume, resultados, custo, tempo, qualidade, risco e trabalho humano.

Um caso individual pode ser aberto como evidência para explicar um padrão, mas não conduz a experiência.

O ciclo pedagógico é:

```text
observar o desempenho de um período
→ identificar um resultado que merece atenção
→ formular hipóteses
→ investigar regras, agentes, dados e casos de exemplo
→ propor alterações
→ negociar conflitos entre perfis
→ aprovar uma nova configuração
→ simular o período seguinte
→ comparar resultados e explicar as causas
```

## 2. O que precisa variar entre missões

Uma missão é um pacote configurável. O sistema não pressupõe fraude, atendimento, marketing ou qualquer setor específico.

Cada missão contém:

1. contexto da empresa e objetivo da operação;
2. indicadores históricos e metas;
3. processo operacional;
4. agentes e componentes técnicos;
5. regras de negócio;
6. perfis disponíveis para escolha;
7. direitos de decisão de cada perfil;
8. relações causais entre configurações e resultados;
9. eventos que podem ocorrer durante a simulação;
10. evidências e casos que podem ser investigados.

## 3. Entrada e escolha de perfil

O participante não escreve uma autobiografia nem interpreta um personagem inventado.

Ao entrar na missão, escolhe um dos perfis disponibilizados pelo facilitador, como:

- CEO;
- CFO;
- Marketing;
- Operações;
- Tecnologia;
- Compliance;
- Risco;
- Segurança;
- Dados;
- Experiência do Cliente.

Uma missão pode usar esses perfis, criar outros ou alterar seus direitos.

### Estrutura de um perfil

```ts
type Profile = {
  id: string;
  name: string;
  purpose: string;
  visibleMetrics: MetricId[];
  privilegedInformation: EvidenceId[];
  canEdit: ControlId[];
  canPropose: ControlId[];
  canApprove: ChangeType[];
  cannotChange: ControlId[];
  requiredApprovals: ApprovalRule[];
  successCriteria: MetricId[];
};
```

### O que o perfil determina na experiência

- quais resultados aparecem em destaque;
- quais evidências podem ser abertas;
- quais controles podem ser alterados diretamente;
- quais alterações precisam ser propostas a outro perfil;
- quais mudanças exigem sua aprovação;
- quais alertas recebe;
- quais resultados serão usados para avaliar suas decisões.

O perfil não muda a realidade compartilhada. Todos atuam sobre a mesma operação, mas possuem informações, responsabilidades e autoridades diferentes.

## 4. Direitos de decisão

Cada controle da operação possui uma política explícita de autoridade.

```ts
type DecisionRight = {
  controlId: string;
  view: ProfileId[];
  propose: ProfileId[];
  edit: ProfileId[];
  approve: ProfileId[];
  veto: ProfileId[];
  approvalMode: "single" | "all" | "quorum" | "facilitator";
};
```

Exemplo genérico:

| Controle | Pode propor | Precisa aprovar | Pode vetar |
|---|---|---|---|
| Trocar o modelo de um agente | Tecnologia, CFO | Tecnologia e Compliance | Segurança |
| Aumentar revisão humana | Operações, Risco | CFO e Operações | — |
| Usar nova fonte de dados | Marketing, Dados | Compliance e Segurança | Compliance |
| Alterar limiar de decisão | Risco, Operações | Risco | Compliance |

## 5. O que é um agente neste produto

Um agente não é sinônimo de Claude, GPT ou Gemini.

- **Modelo** é o sistema de IA utilizado para interpretar e gerar uma saída.
- **Fornecedor** é a organização que disponibiliza o modelo.
- **API** é uma forma de acessar um modelo ou uma ferramenta.
- **Agente** é um componente configurado para cumprir uma responsabilidade dentro da operação.
- **Orquestrador** coordena a execução dos componentes e mantém o estado do processo.

### Estrutura de um agente

```ts
type Agent = {
  id: string;
  name: string;
  businessPurpose: string;
  owner: string;
  provider: string;
  model: string;
  modelVersion: string;
  accessMode: "external_api" | "private_endpoint" | "self_hosted";
  applicationHosting: string;
  dataResidency: string;
  systemInstructions: string;
  inputSchema: object;
  outputSchema: object;
  tools: ToolId[];
  contextSources: DataSourceId[];
  memory: MemoryPolicy;
  parameters: AgentParameters;
  permissions: Permission[];
  authorityLimit: string;
  timeoutMs: number;
  retryPolicy: RetryPolicy;
  fallback: FallbackPolicy;
  evaluations: EvaluationResult[];
  unitEconomics: AgentEconomics;
};
```

### Ficha que o participante abre

Toda ficha de agente deve responder, nesta ordem:

1. Que trabalho este agente realiza?
2. Por que esse trabalho foi separado dos demais?
3. O que ele recebe?
4. Qual modelo utiliza?
5. Quem fornece esse modelo?
6. O acesso ocorre por API externa, endpoint privado ou hospedagem própria?
7. Quais dados podem sair da empresa?
8. Quais ferramentas ele pode usar?
9. Quais instruções recebeu?
10. O que devolve?
11. O que está autorizado a fazer?
12. O que não pode fazer?
13. Quanto custa e quanto demora?
14. Como foi avaliado?
15. O que acontece se falhar?

## 6. Troca de modelo e configuração do agente

O modelo utilizado pelo agente é um controle modificável, sujeito aos direitos do perfil.

```ts
type ModelOption = {
  provider: string;
  model: string;
  version: string;
  accessMode: string;
  inputCost: number;
  outputCost: number;
  medianLatencyMs: number;
  contextWindow: number;
  toolUseSupport: boolean;
  structuredOutputReliability: number;
  evaluationScores: Record<string, number>;
  dataResidency: string;
  retentionPolicy: string;
  knownConstraints: string[];
};
```

Ao trocar um modelo, a interface precisa apresentar:

- custo estimado no volume da operação;
- tempo de resposta;
- qualidade nas avaliações relevantes para aquela missão;
- consistência de saída estruturada;
- compatibilidade com ferramentas;
- localização e retenção dos dados;
- dependência do fornecedor;
- necessidade de revalidação;
- regras, limites e componentes afetados.

O simulador nunca afirma que um fornecedor é universalmente melhor. Compara opções usando critérios e avaliações definidos na missão.

## 7. Regras de negócio

Uma regra conecta intenção empresarial, implementação técnica, autoridade e consequências.

```ts
type BusinessRule = {
  id: string;
  name: string;
  businessStatement: string;
  objective: string;
  condition: Expression;
  action: Action;
  exceptions: Exception[];
  ownerProfile: ProfileId;
  decisionRights: DecisionRight;
  implementation: TechnicalBinding[];
  dependencies: Dependency[];
  affectedMetrics: MetricEffect[];
  conflictsWith: RuleId[];
  version: string;
  evidence: EvidenceId[];
};
```

### Exibição obrigatória de uma regra

Cada regra aparece em cinco camadas conectadas:

1. **Em linguagem de negócio:** o comportamento desejado.
2. **Condição atual:** quando a regra é acionada.
3. **Ação atual:** o que acontece quando ela é acionada.
4. **Implementação técnica:** agentes, modelos, ferramentas, dados, filas e sistemas envolvidos.
5. **Consequências:** impacto esperado em custo, tempo, qualidade, risco e capacidade.

### Tipos de controle que uma regra pode expor

- limiar numérico;
- condição booleana;
- fonte de dados obrigatória;
- modelo utilizado;
- limite de chamadas;
- timeout;
- número de tentativas;
- ordem ou paralelismo;
- fallback;
- escalonamento humano;
- prioridade de fila;
- limite de autoridade;
- necessidade de aprovação;
- retenção de dados;
- segmento ou escopo de aplicação.

## 8. Proposta em linguagem natural

O participante pode selecionar um controle ou escrever uma intenção, como:

> Quero reduzir o número de decisões que chegam à equipe humana.

A IA não aplica essa frase diretamente. Ela a traduz para uma proposta estruturada:

```ts
type ChangeProposal = {
  authorProfile: ProfileId;
  statedIntent: string;
  targetControls: ControlChange[];
  assumptions: string[];
  affectedRules: RuleId[];
  affectedAgents: AgentId[];
  requiredApprovals: ProfileId[];
  predictedEffects: SimulationDelta[];
  unresolvedRisks: string[];
  status: "draft" | "proposed" | "approved" | "rejected" | "applied";
};
```

Antes do envio, o participante vê exatamente o que será alterado. Nenhuma intenção vaga modifica a operação sem confirmação.

## 9. Modelo de consequências

O sistema deve separar explicação generativa de cálculo causal.

- A IA interpreta perfis, traduz propostas e explica resultados.
- O motor de simulação calcula impactos usando relações declaradas e dados da missão.

### Dimensões mínimas de resultado

```ts
type SimulationOutcome = {
  businessResult: number;
  operatingCost: number;
  modelAndApiCost: number;
  humanWorkload: number;
  averageTime: number;
  p95Time: number;
  automatedRate: number;
  escalationRate: number;
  errorRate: number;
  reversalRate: number;
  customerImpact: number;
  riskExposure: number;
  complianceEvents: number;
  systemAvailability: number;
};
```

### Relação causal

```ts
type CausalRelation = {
  sourceControl: ControlId;
  targetMetric: MetricId;
  direction: "increase" | "decrease" | "nonlinear";
  formula: string;
  validRange: [number, number];
  confidence: "measured" | "estimated" | "hypothetical";
  evidence: EvidenceId[];
  sideEffects: CausalRelation[];
};
```

Toda previsão precisa indicar se é:

- medida com dados históricos;
- estimada a partir de testes;
- hipótese criada para fins didáticos.

O sistema não deve apresentar falsa precisão.

## 10. Conflitos entre propostas

O motor identifica conflitos de quatro tipos:

1. **Objetivo:** duas propostas pressionam o mesmo indicador em direções opostas.
2. **Capacidade:** a configuração exige mais recursos do que estão disponíveis.
3. **Autoridade:** falta aprovação ou existe veto aplicável.
4. **Arquitetura:** uma mudança quebra dependências, avaliações ou compatibilidade.

Exemplo genérico:

```text
CFO propõe reduzir custo de modelos em 30%
Tecnologia troca dois agentes por modelos menores
Operações propõe aumentar automação
Compliance exige evidência adicional em decisões de alto impacto

Resultado do sistema:
A configuração reduz custo de API, mas a avaliação disponível indica mais
respostas incompletas. A evidência adicional aumenta chamadas e anula parte
da economia. A automação proposta não pode ser aprovada sem nova avaliação.
```

## 11. Estado compartilhado da sessão

Facilitador, projeção e participantes usam o mesmo estado.

```ts
type SessionState = {
  missionId: string;
  phase: SessionPhase;
  period: number;
  participants: Participant[];
  profileAssignments: ProfileAssignment[];
  currentConfiguration: OperationConfiguration;
  visibleEvidence: EvidenceId[];
  proposals: ChangeProposal[];
  approvals: Approval[];
  simulationResults: SimulationOutcome[];
  facilitatorControls: FacilitatorState;
};
```

Quando o facilitador avança, todas as telas recebem a nova fase. Quando um participante propõe uma mudança, ela aparece no cockpit do facilitador e, quando aplicável, nas telas dos perfis que precisam aprová-la.

## 12. Cockpit de validação

O protótipo deve oferecer ao facilitador um ambiente único para testar a sessão inteira:

```text
┌──────────────────────────────────────────────────────────────┐
│ FASE · TEMPO · AVANÇAR · REVELAR · SIMULAR NOVO PERÍODO     │
├───────────────────┬──────────────────────────────────────────┤
│ Participantes     │ Visualização selecionada                 │
│ Ana · CFO         │ ○ Projeção coletiva                      │
│ Bruno · Tecnologia│ ● Celular de Bruno                       │
│ Carla · Compliance│ ○ Arquitetura                            │
│ ...               │ ○ Resultados                             │
│                   │                                          │
│ status individual │ conteúdo interativo exato                │
├───────────────────┴──────────────────────────────────────────┤
│ propostas · aprovações · conflitos · estado compartilhado   │
└──────────────────────────────────────────────────────────────┘
```

O facilitador consegue:

- escolher qualquer participante;
- ver e operar sua tela exata;
- manter os controles da sessão sempre visíveis;
- alternar para a projeção coletiva;
- verificar respostas e propostas;
- representar vários perfis durante testes individuais;
- avançar, voltar e reiniciar um período;
- inspecionar por que uma tela mostra determinada informação.

## 13. Sequência de uma sessão

### Fase 1 — Compreender a operação

Apresentar objetivo, fluxo, indicadores e período histórico sem solicitar decisões.

### Fase 2 — Compreender a arquitetura

Abrir agentes, modelos, fornecedores, ferramentas, dados, regras, orquestração e autoridade.

### Fase 3 — Escolher perfis

Participantes ocupam os lugares disponíveis. O sistema revela direitos, informações e objetivos.

### Fase 4 — Analisar resultados

Cada perfil recebe os indicadores e evidências relevantes. Casos individuais podem ser abertos como amostras.

### Fase 5 — Propor alterações

Participantes modificam controles autorizados ou enviam propostas estruturadas.

### Fase 6 — Negociar e aprovar

O sistema evidencia conflitos, dependências, aprovações e vetos.

### Fase 7 — Simular o novo período

O motor executa a configuração aprovada e produz novos resultados.

### Fase 8 — Explicar consequências

O grupo compara períodos e reconstrói quais mudanças produziram cada efeito.

## 14. Critério de qualidade pedagógica

Ao final, um participante deve conseguir explicar:

1. a diferença entre modelo, agente, ferramenta, API e orquestrador;
2. como a operação foi dividida entre agentes;
3. qual modelo e fornecedor cada agente utiliza;
4. quais regras transformam resultados dos agentes em ações;
5. quem pode alterar ou aprovar cada regra;
6. como uma decisão de negócio modifica a implementação técnica;
7. por que uma melhoria em um indicador pode piorar outro;
8. quais resultados são medidos, estimados ou hipotéticos;
9. como a nova configuração produziu o resultado simulado.

## 15. O que não deve ser construído antes deste modelo estar implementado

- telas decorativas de dashboard;
- role-play com perguntas genéricas;
- decisões isoladas sem relação causal;
- nomes técnicos sem explicação contextual;
- escolha de alternativas sem consequências;
- IA inventando números de impacto;
- perfis sem direitos reais de decisão;
- agentes apresentados apenas como caixas em um diagrama.

