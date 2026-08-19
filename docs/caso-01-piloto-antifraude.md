# Caso 01 — Piloto de prevenção a fraudes

> **Documento legado.** Este caso antecede o modelo universal do simulador e não deve orientar a interface atual. A especificação canônica está em `docs/modelo-do-simulador.md`. O conteúdo abaixo poderá ser convertido futuramente em uma missão compatível.

## Finalidade pedagógica

Este caso ensina como uma decisão operacional com IA é produzida por uma cadeia formada por modelos, agentes, ferramentas, dados, regras, permissões, sistemas e pessoas.

Ao final, o participante deve conseguir:

1. reconstruir como uma decisão foi produzida;
2. distinguir modelo, agente, ferramenta, orquestrador, regra e sistema executor;
3. identificar onde informação, autoridade e execução estão separadas;
4. avaliar quando uma intervenção humana é um controle real;
5. modificar a arquitetura e reconhecer os novos riscos introduzidos.

## Regra de explicação do produto

Nenhum termo técnico aparece isoladamente. Todo elemento é apresentado em sete campos:

1. **Em linguagem comum:** o que significa sem jargão;
2. **Nome técnico:** como profissionais chamam esse elemento;
3. **Função neste piloto:** o que ele faz aqui;
4. **Configuração atual:** como foi parametrizado;
5. **Quem decidiu:** área ou responsável pela configuração;
6. **Por que importa:** relação com o incidente;
7. **Se fosse diferente:** consequências de alterar a configuração.

## Situação empresarial

Um banco está no 17º dia de um piloto para reduzir perdas por fraude em transferências digitais.

O piloto já analisou 38 mil transferências. As perdas caíram 18%, mas 6,4% das transações retidas foram posteriormente consideradas legítimas.

Uma transferência de R$ 180 mil foi temporariamente retida. O cliente contesta a ação, informa que está viajando e precisa concluir o pagamento a um fornecedor em 18 minutos.

O cliente registrou a viagem 20 minutos antes e concluiu uma autenticação adicional no aplicativo do banco.

## O processo em linguagem comum

```text
O cliente pede uma transferência
            ↓
O banco calcula o risco de fraude
            ↓
O banco procura informações que expliquem a operação
            ↓
Uma política determina qual ação é permitida
            ↓
O sistema libera, pede autenticação ou retém
            ↓
Casos não resolvidos podem chegar a uma pessoa
```

## Arquitetura implementada

```text
Aplicativo do cliente
        ↓
API de transferências
        ↓
Decision Flow
        ├── FraudScore 4.7
        └── Context Agent 0.9
                ├── consultar_viagem
                ├── consultar_historico
                └── consultar_dispositivo
        ↓
Rules Engine — regra R-17
        ↓
Payment API — conta svc-payment-risk
        ↓
Fila humana de exceções
```

## Componente 1 — Decision Flow

### Em linguagem comum

É o componente que acompanha a transferência durante todo o percurso. Ele chama as análises, espera respostas, guarda o que já aconteceu e encaminha o processo para a próxima etapa.

### Nome técnico

Workflow de orquestração.

“Orquestrador” não é necessariamente um produto ou um agente. É uma função técnica que pode ser implementada por código próprio, um motor de workflow ou uma plataforma.

### Função neste piloto

- abrir uma execução para cada transferência;
- chamar o FraudScore e o Context Agent;
- guardar os resultados;
- enviar os resultados ao Rules Engine;
- controlar timeout e novas tentativas;
- encaminhar exceções para a fila humana.

### Configuração atual

- timeout total: 30 segundos;
- até uma nova tentativa por componente;
- fallback: manter retenção quando o fluxo não termina;
- estado preservado por 90 dias;
- chamadas de risco e contexto em paralelo.

### Quem decidiu

Time de plataforma, com aprovação de Arquitetura e Risco.

### Por que importa

O Decision Flow preservou o resultado final, mas não guardou a resposta completa das ferramentas usadas pelo agente. A organização sabe que “viagem não foi encontrada”, mas não consegue provar qual versão dos dados foi consultada.

### Se fosse diferente

- guardar todas as respostas melhora auditoria, mas aumenta custo e retenção de dados;
- timeout menor reduz latência, mas aumenta respostas incompletas;
- executar em série permite usar um resultado no próximo passo, mas aumenta o tempo total;
- mudar o fallback para liberação reduz bloqueios, mas aumenta exposição a fraude.

## Componente 2 — FraudScore 4.7

### Em linguagem comum

É um cálculo que estima a probabilidade de uma transferência ser fraudulenta.

### Nome técnico

Modelo supervisionado de classificação, implementado com gradient boosting.

### Função neste piloto

Receber características da transferência e retornar um número entre 0 e 1.

### Configuração atual

- versão: 4.7;
- saída deste caso: 0,87;
- principais sinais: dispositivo novo, valor atípico e destinatário recente;
- não consulta viagem nem autenticação;
- não possui permissão para executar ações.

### Quem decidiu

Time de prevenção a fraudes e ciência de dados.

### Por que importa

O score de 0,87 foi tecnicamente coerente com os sinais recebidos. O problema não pode ser explicado apenas como “erro do modelo”.

### Se fosse diferente

- um limiar mais alto reduz falsos positivos, mas permite mais fraudes;
- incluir contexto de viagem pode melhorar a decisão, mas cria dependência de outra fonte;
- recalibrar o modelo altera a interpretação dos scores sem mudar as regras do processo.

## Componente 3 — Context Agent 0.9

### Em linguagem comum

É um componente que recebe uma tarefa, escolhe quais consultas realizar e organiza as informações encontradas em uma recomendação.

### Nome técnico

Agente baseado em modelo de linguagem com acesso a ferramentas.

### Função neste piloto

Procurar informações que tornem a transferência plausível ou indiquem inconsistência de contexto.

### Modelo utilizado

Atlas Small, acessado por API de fornecedor externo.

### Instrução principal

> Analise o contexto da transferência. Consulte somente as ferramentas disponíveis. Não presuma que a ausência de um resultado prova que o evento não ocorreu. Retorne uma recomendação estruturada e indique as fontes consultadas.

### Ferramentas disponíveis

- `consultar_viagem(cliente_id)`;
- `consultar_historico(cliente_id, periodo)`;
- `consultar_dispositivo(dispositivo_id)`.

### Permissões

Pode apenas ler informações. Não pode:

- alterar o CRM;
- alterar uma regra;
- chamar a Payment API;
- liberar ou reter dinheiro;
- criar novas ferramentas.

### Parâmetros atuais

#### Temperatura: 0,1

**Em linguagem comum:** controla quanto a resposta pode variar entre execuções semelhantes. Valores baixos tendem a produzir respostas mais estáveis; valores altos permitem maior variação.

**Neste piloto:** foi usado 0,1 porque o objetivo é consistência, não criatividade.

**Quem decidiu:** time responsável pelo agente, durante testes de avaliação.

**Por que importa:** uma temperatura baixa não garante verdade nem precisão. Ela apenas reduz variação na geração.

**Se fosse maior:** o agente poderia formular interpretações diferentes para o mesmo contexto, aumentando a dificuldade de teste e auditoria.

**O que não significa:** 0,1 não representa “10% de criatividade” nem “90% de certeza”.

#### Máximo de três chamadas de ferramentas

**Em linguagem comum:** o agente pode realizar no máximo três consultas externas durante uma execução.

**Por que existe:** controla custo, latência e comportamento repetitivo.

**Por que importa:** se uma consulta falha, o limite pode impedir uma tentativa alternativa.

**Se fosse maior:** o agente teria mais possibilidades de investigação, mas poderia aumentar tempo, custo e variabilidade.

#### Timeout total de dois segundos

**Em linguagem comum:** o agente precisa concluir seu trabalho em até dois segundos.

**Por que existe:** a transferência precisa de resposta rápida.

**Por que importa:** uma ferramenta lenta pode deixar o agente sem contexto suficiente.

**Se fosse maior:** aumentaria a chance de obter contexto, mas também o tempo percebido pelo cliente.

#### Sem memória entre transferências

**Em linguagem comum:** cada transferência começa sem lembrar conversas ou execuções anteriores.

**Por que existe:** reduz mistura de informações entre clientes e simplifica auditoria.

**Por que importa:** continuidade precisa vir dos sistemas e do estado do workflow, não da memória informal do agente.

#### Saída estruturada obrigatória

```json
{
  "contexto_compativel": false,
  "confianca": 0.71,
  "evidencias_consultadas": [
    "viagem",
    "historico",
    "dispositivo"
  ],
  "recomendacao": "reter"
}
```

**Em linguagem comum:** o agente precisa responder usando campos predefinidos.

**Por que existe:** outros componentes precisam interpretar a resposta de forma previsível.

**Por que importa:** estrutura reduz ambiguidades de integração, mas não garante que o conteúdo esteja correto.

## Ferramenta — consultar_viagem

### Em linguagem comum

É a consulta que permite ao agente procurar se o cliente informou uma viagem.

### Nome técnico

Ferramenta de leitura exposta ao agente por uma função tipada.

### Entrada

`cliente_id`

### Saída

- viagem encontrada;
- destino;
- início e fim;
- horário da última atualização.

### Fonte real

Uma réplica analítica do CRM, atualizada a cada seis horas.

### Por que importa

A viagem estava no CRM original, mas ainda não estava na réplica. O agente utilizou corretamente a ferramenta disponível e recebeu uma informação desatualizada.

### Se fosse diferente

- consulta direta ao CRM reduz defasagem;
- também cria dependência no caminho crítico;
- adiciona aproximadamente 900 milissegundos;
- aumenta volume de consultas;
- exige nova permissão e tratamento de indisponibilidade.

## Componente 4 — Rules Engine e regra R-17

### Em linguagem comum

É a política automatizada que transforma análises em uma ação permitida.

### Nome técnico

Motor determinístico de regras de negócio.

### Regra atual

```text
SE score de fraude > 0,82
E viagem não encontrada
ENTÃO reter temporariamente
```

### Quem decidiu

Diretoria de Risco, antes da entrada do Context Agent no piloto.

### Por que importa

A regra trata “viagem não encontrada” como se significasse “viagem inexistente”. Ela também ignora autenticação adicional.

### Se fosse diferente

- incluir autenticação cria uma ação intermediária;
- diferenciar ausência de informação de confirmação negativa reduz falsas conclusões;
- aumentar o limiar reduz retenções e aumenta exposição;
- criar faixas de valor melhora alçada, mas amplia quantidade de caminhos para testar.

## Componente 5 — Payment API

### Em linguagem comum

É o sistema que efetivamente altera o estado da transferência.

### Identidade técnica

`svc-payment-risk`

### Permissão atual

Pode reter transferências de até R$ 500 mil sem aprovação adicional.

### Distinção importante

- o agente recomenda;
- a regra autoriza;
- a conta técnica executa.

### Por que importa

Permissão técnica e alçada de negócio são controles diferentes. Uma conta conseguir realizar uma ação não significa que a organização deveria autorizá-la em todas as condições.

## Componente 6 — Fila humana

### Em linguagem comum

É a equipe que recebe situações que o fluxo automático não consegue concluir.

### Configuração presumida no desenho

- atendimento em até 20 minutos;
- capacidade para 34 casos por hora.

### Situação real

- mediana atual: 40 minutos;
- capacidade: 11 casos por hora;
- 23 casos aguardando.

### Por que importa

Uma pessoa no processo não funciona como controle quando não possui tempo, contexto ou autoridade para agir.

## Execução do incidente

```text
14:03:08 — transferência recebida
14:03:09 — execução ORQ-93821 criada
14:03:09 — FraudScore iniciado
14:03:09 — Context Agent iniciado
14:03:10 — FraudScore retorna 0,87
14:03:10 — agente chama consultar_viagem
14:03:11 — ferramenta retorna “não encontrada”
14:03:11 — agente consulta histórico e dispositivo
14:03:12 — agente recomenda retenção
14:03:12 — regra R-17 v3 aplicada
14:03:13 — svc-payment-risk executa retenção
14:03:14 — caso enviado à fila humana
14:04:08 — cliente contesta
14:05:02 — incidente escalado
```

## Evidências investigáveis

Os participantes não recebem tudo de uma vez. Podem escolher o que consultar:

1. saída do FraudScore;
2. instrução e parâmetros do agente;
3. ferramentas disponíveis;
4. resposta de `consultar_viagem`;
5. horário de atualização da réplica;
6. log do Decision Flow;
7. regra R-17;
8. permissão de `svc-payment-risk`;
9. registro da autenticação;
10. capacidade da fila humana;
11. documentação aprovada do piloto;
12. métricas dos 17 dias.

Cada evidência possui:

- conteúdo bruto;
- explicação em linguagem comum;
- conceito técnico associado;
- relevância para o incidente;
- pergunta sugerida ao facilitador.

## Decisões de contenção

### Manter a retenção

- protege contra fraude imediata;
- faz a operação perder o prazo;
- mantém dependência da fila humana;
- exige responsável pelo impacto ao cliente.

### Liberar por exceção

- preserva o pagamento;
- aceita exposição residual;
- exige autoridade identificada;
- exige registro da justificativa e das evidências.

### Solicitar nova autenticação

- não é executável automaticamente no desenho atual;
- o resultado da autenticação não entra no Decision Flow;
- exige intervenção manual para este incidente.

### Suspender retenções automáticas na faixa

- contém falsos positivos enquanto o problema é investigado;
- transfere volume para a operação humana;
- ultrapassa a capacidade atual em menos de uma hora.

## Alterações possíveis no redesenho

Cada alteração retorna quatro respostas: resolve, introduz, exige e não resolve.

### Consultar o CRM original em tempo real

- **Resolve:** defasagem da informação de viagem;
- **Introduz:** dependência crítica e latência;
- **Exige:** permissão, capacidade e fallback;
- **Não resolve:** autenticação continua fora do fluxo.

### Adicionar autenticação como ferramenta

- **Resolve:** sinal relevante fora do contexto;
- **Introduz:** nova integração e finalidade de acesso;
- **Exige:** regra atualizada e tratamento de indisponibilidade;
- **Não resolve:** capacidade humana em outras exceções.

### Diferenciar dado ausente de evento inexistente

- **Resolve:** interpretação indevida de respostas incompletas;
- **Introduz:** um terceiro estado nas regras;
- **Exige:** novos testes e caminhos de fallback;
- **Não resolve:** atraso da fonte.

### Preservar respostas das ferramentas

- **Resolve:** reconstrução insuficiente da decisão;
- **Introduz:** armazenamento e exposição de dados;
- **Exige:** política de retenção e controle de acesso;
- **Não resolve:** qualidade da decisão em tempo real.

## Responsabilidades dos participantes

### Qualidade da decisão

Examina modelos, agente, evidências e limites das recomendações.

### Viabilidade técnica

Examina arquitetura, integrações, ferramentas, estado, timeout e fallback.

### Autoridade e exposição

Examina regras, permissões, alçadas e aceitação de risco.

### Capacidade operacional

Examina prazo, reversibilidade, fila humana e execução real.

As responsabilidades não são personagens. Cada participante continua sendo ele próprio e responde temporariamente por uma dimensão da decisão.

## Estrutura da sessão

1. facilitador apresenta o processo em linguagem comum;
2. arquitetura é revelada progressivamente;
3. participantes exploram a documentação técnica;
4. execução problemática é apresentada;
5. cada participante formula uma hipótese;
6. mesa escolhe evidências;
7. evidências geram feedback imediato;
8. mesa decide contenção;
9. sistema apresenta consequência;
10. mesa modifica a arquitetura;
11. motor apresenta novos trade-offs;
12. facilitador conduz o debrief.

## Critério de qualidade da interface

Para qualquer termo, parâmetro ou componente, o participante deve conseguir abrir “Entender” e responder:

- O que é?
- Para que serve?
- Como está configurado aqui?
- Quem escolheu essa configuração?
- Por que isso importa neste incidente?
- O que mudaria se fosse diferente?
- O que esse elemento não significa?

Se a interface mostrar um valor sem responder a essas perguntas, a informação está incompleta.
