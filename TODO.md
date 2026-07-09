# AgroMind TODO (Premium Product Refactor)

> Objetivo: transformar o AgroMind em um software com aparência e qualidade de produto real (UX premium, arquitetura robusta, integração perfeita frontend/backend/IA) sem quebrar funcionalidades existentes.

## 0) Auditoria completa (obrigatório)
- [ ] 0.1 Levantar stack e contratos existentes
  - [ ] Inspecionar endpoints atuais no backend (Controllers) e payloads esperados.
  - [ ] Inspecionar services do frontend (api client, auth, ai, weather, geocoding) e quais endpoints são consumidos.
  - [ ] Inspecionar routers do FastAPI (chat/diagnosis/prediction) e respostas esperadas.
- [ ] 0.2 Detectar problemas
  - [ ] Erros de compilação/lint atuais (frontend e backend).
  - [ ] Warnings importantes.
  - [ ] Botões/links sem ação (UI).
  - [ ] Componentes incompletos/estados falsos.
  - [ ] Falhas de integração (ex: payloads divergentes, status codes, CORS, auth).
  - [ ] Checar migrations e índices (DB).
- [ ] 0.3 Criar relatório de auditoria
  - [ ] Listar bugs encontrados.
  - [ ] Listar melhorias por prioridade (impacto vs esforço).
  - [ ] Listar arquivos que serão alterados.

## 1) Planejamento técnico de refatoração (sem mudar funcionalidade ainda)
- [ ] 1.1 Definir contrato de API para UI premium
  - [ ] Padronizar estrutura de erro e sucesso (ProblemDetails / Result<T> / códigos.
  - [ ] Garantir consistência de status codes e mensagens para toast/alert UI.
- [ ] 1.2 Definir “UI contract”
  - [ ] Nomear/normalizar campos usados no frontend (ex: risco, confiança, modelo, recomendações, progresso).
  - [ ] Mapear estados necessários: loading, success, empty, error, offline.

## 2) Frontend — Fundação Premium (Design System + Layout + Estados) 
> Prioridade máxima. Sem reaproveitar layout atual visualmente.

### 2.1 Design System (tokens + base)
- [ ] 2.1.1 Criar tokens (cores, tipografia, spacing, radius, shadows)
- [ ] 2.1.2 Implementar tema (ex: verde escuro/oliva/terrosos + cinzas)
- [ ] 2.1.3 Ajustar `index.css` / setup Tailwind (sem quebrar classes existentes)

### 2.2 Componentes reutilizáveis
- [ ] 2.2.1 Atualizar `components/ui/Primitives.jsx`
  - [ ] Button: tamanhos consistentes, states (hover/focus/disabled)
  - [ ] Input / Textarea / Select com validação e mensagens
  - [ ] Modal completo (open/close, foco, overlay, escape)
  - [ ] Table (headers, zebra optional, empty state)
  - [ ] Badge / Pill / Chip
- [ ] 2.2.2 Loading e estados
  - [ ] Skeletons profissionais
  - [ ] Loading overlay / inline loading
  - [ ] EmptyState padronizado
- [ ] 2.2.3 Toast + Error UI
  - [ ] Criar Toast provider (ou integrar com lib já existente)
  - [ ] Padronizar erro: “mensagem amigável + detalhes técnicos em log"

### 2.3 Layout premium
- [ ] 2.3.1 Refatorar `components/layout/AppLayout.jsx`
  - [ ] Navbar superior
  - [ ] Sidebar com collapse responsivo
  - [ ] Perfil/Config dropdown funcional (rotas corretas)
- [ ] 2.3.2 Refatorar `components/layout/PrivateRoute.jsx` se necessário
  - [ ] Garantir redirecionamento correto e tratamento de auth/401/403

### 2.4 Serviços de integração frontend
- [ ] 2.4.1 Ajustar `services/api.js` / axios client
  - [ ] Interceptor JWT + handling de refresh (se existir)
  - [ ] Erros tipados para toast
- [ ] 2.4.2 Ajustar `services/ai.js`, `services/weather.js`, `services/geocoding.js`
  - [ ] Garantir payloads corretos e parsing robusto

## 3) Frontend — Páginas (todas com UX premium e funcionalidades completas)
- [ ] 3.1 Landing
  - [ ] Rota pública `/` com Hero/Benefícios/Como funciona/Tecnologias/Demonstração/Sobre IA/Contato/Footer
- [ ] 3.2 Login / Register / Forgot Password
  - [ ] validações completas
  - [ ] loading no submit
  - [ ] toast success/error
- [ ] 3.3 Dashboard
  - [ ] Mapa + Clima + Risco da lavoura + Alertas + Últimos diagnósticos + Histórico/Resumo
- [ ] 3.4 Diagnóstico
  - [ ] Progresso + status analisando + confiança + modelo + explicação + recomendações
  - [ ] Persistir histórico se backend suportar
- [ ] 3.5 Chat (IA integrada)
  - [ ] status analisando + tempo de resposta + confiança (se disponível)
  - [ ] histórico de conversas
- [ ] 3.6 Fazendas / Campos / Clima / Alertas
  - [ ] Tabelas e filtros
  - [ ] modais de detalhe e ações reais
- [ ] 3.7 Perfil / Configurações
  - [ ] Exibir dados reais; ações completas (save, logout, etc.)

## 4) Backend — Revisão Arquitetural e Robustez
- [ ] 4.1 Controllers thin + validação
  - [ ] Revisar todos Controllers usados pela UI
  - [ ] Aplicar validação (FluentValidation) e retornar erros padronizados
- [ ] 4.2 Padronizar contratos
  - [ ] Garantir `Result<T>` em respostas
  - [ ] Atualizar tratamento de erros do middleware
- [ ] 4.3 DI e HttpClient
  - [ ] Garantir HttpClient configura timeout por request
  - [ ] Ajustar retries/backoff em integrações com FastAPI/Groq
- [ ] 4.4 Auth/JWT
  - [ ] Garantir 401/403 consistentes
  - [ ] Verificar refresh token se existir no projeto
- [ ] 4.5 Hangfire
  - [ ] Garantir jobs confiáveis, sem duplicações, com logs
- [ ] 4.6 Logs e Observabilidade
  - [ ] correlationId por request
  - [ ] logs estruturados e sem dados sensíveis
- [ ] 4.7 Banco (performance)
  - [ ] Revisar migrations (índices existentes)
  - [ ] Checar consultas pesadas / N+1

## 5) FastAPI (ia-service) — Resiliência e Contratos Premium
- [ ] 5.1 Timeout + retries por endpoint
- [ ] 5.2 Validar response schema com Pydantic
- [ ] 5.3 Erros retornados com códigos que o backend consiga mapear
- [ ] 5.4 Garantir que “status analisando/progresso/confiança/modelo/recomendações” existem nos contratos usados

## 6) QA Integração e Performance
- [ ] 6.1 Testes (por etapa)
  - [ ] Backend: `dotnet test`
  - [ ] Frontend: build + lint
  - [ ] FastAPI: smoke tests básicos (health + 1 endpoint)
- [ ] 6.2 Verificar integração end-to-end
  - [ ] Login → dashboard
  - [ ] Diagnóstico → histórico + UI
  - [ ] Chat → resposta com status/tempo
- [ ] 6.3 Performance
  - [ ] Mapas/gráficos: evitar re-renders e payload excessivo
  - [ ] API: paginação quando aplicável

## 7) README Profissional e Portfólio
- [ ] 7.1 Atualizar README.md com:
  - [ ] badges, screenshots reais, GIFs
  - [ ] arquitetura + fluxograma
  - [ ] tecnologias e deploy
  - [ ] variáveis de ambiente
  - [ ] roadmap
  - [ ] contribuição e licença
  - [ ] estrutura das pastas

## 8) Auditoria Final (antes de finalizar)
- [ ] 8.1 Checklist de qualidade (obrigatório)
  - [ ] Nenhum botão sem ação
  - [ ] Nenhum link quebrado
  - [ ] Nenhum componente incompleto
  - [ ] Nenhum erro de compilação
  - [ ] Nenhum warning importante
  - [ ] Responsividade OK
  - [ ] Integração frontend↔API↔FastAPI OK
  - [ ] Aparência premium (sem template)
- [ ] 8.2 Relatório final
  - [ ] bugs encontrados
  - [ ] melhorias feitas
  - [ ] arquivos alterados
  - [ ] funcionalidades corrigidas/adicionadas
  - [ ] melhorias de performance
  - [ ] melhorias visuais e UX
  - [ ] melhorias de arquitetura

