# GrafoNet — frontend

Frontend React + TypeScript para autenticação, perfil, rede, conexões e orientações do GrafoNet.

## Produção na AWS

- Site: <http://34.203.245.73>
- API e documentação: <http://34.203.245.73/api/docs/>

Gere o build com `VITE_API_URL=/api npm run build` e publique o conteúdo de
`dist/` pelo Nginx, com fallback para `index.html`. Na ausência de
`VITE_API_URL`, o cliente usa `/api`. A API Flask continua sem prefixo
internamente; o Nginx remove `/api/` ao encaminhar as chamadas.

O `.env` local não é versionado. Variáveis `VITE_*` entram no JavaScript
público: nunca coloque nelas credenciais do banco, SMTP ou Gemini.

## Executar

Copie `.env.example` para `.env` e configure a URL da API:

```env
VITE_API_URL=http://localhost:5000
```

Depois inicie o frontend:

```powershell
npm ci
npm run dev
```

As requisições usam um cliente Axios compartilhado (`src/services/apiClient.ts`), com `baseURL` vinda de `VITE_API_URL`, timeout de 10 segundos e inclusão automática do JWT nas rotas autenticadas.
A API libera CORS somente para o seu `FRONTEND_URL`. Em desenvolvimento, abra o app em `http://localhost:5173`; `127.0.0.1` ou o IP da rede são bloqueados.

## Telas de acesso

- `/login`: entrada com e-mail e senha.
- `/register?token=...`: cadastro, acessível somente pelo link do e-mail de convite. Sem token, redireciona para `/login`. Nenhum link leva a esta tela.

## Endpoints esperados

- `POST /auth/login`: recebe `{ "email": "...", "password": "..." }`,
  retorna `{ "access_token": "...", "user": { "id": "...", "email": "..." } }`.
  O JWT é enviado às rotas protegidas pelo header `Authorization: Bearer`.
- `GET /auth/me`: retorna `{ "id": "...", "email": "..." }` para uma sessão
  válida e HTTP 401 quando não há sessão.
- `POST /auth/logout`: encerra e revoga o JWT atual.
- `POST /auth/register`: recebe `{ "profile": { "name": "...",
  "course_id": "...", "semester": 1, "field_id": "...", "bio": "..." },
  "email": "...", "password": "...", "invite_token": "..." }` e retorna `{ "id": "...",
  "email": "..." }`. O token é lido do parâmetro `?token=...` da URL.
- `POST /invitations`: recebe `{ "email": "..." }` de um usuário autenticado,
  envia o convite por e-mail e retorna os dados públicos do convite. O link de
  cadastro usa `/register?token=...`.

O JWT é persistido em `localStorage` na chave `grafonet.access_token`, conforme o
AuthProvider da main. Ao recarregar, a sessão fica pendente até validar `/auth/me`;
401 remove o token, enquanto falhas temporárias permitem tentar novamente. O token
do convite é enviado somente na requisição de cadastro; após o cadastro, o
parâmetro é removido da URL. Senhas e tokens não são registrados no console.
O backend valida convites e e-mails institucionais e aplica as regras de senha.

## Verificações

```powershell
npm test
npm run lint
npm run build
```

## Perfil e configurações da conta

O cadastro envia `profile` com `name`, `course_id`, `semester`, `field_id` e `bio`.
Cursos e áreas vêm de `GET /profiles/options`; o limite de semestres vem de cada curso (8 ou 10). Área e bio são opcionais e o cadastro pede só nome, e-mail, senha, curso e semestre. Não há
campo de interesses. Nome e dados pessoais pertencem ao perfil, não ao usuário.

As telas ficam em `src/pages` e os formulários em `src/components`:

- `/`: grafo de conexões próximas e busca por afinidade, com painel de pessoa.
- `/profile`: somente o próprio perfil, foto e experiências.
- `/profile/edit`: nome, curso, semestre, área e bio.
- `/profile/experiences`: seleção de entidades e iniciação científica; aparece como
  etapa opcional após o primeiro login. Pular ou salvar persiste sua conclusão.
- `/research-projects`: pesquisas compartilhadas; criar e editar pelo criador.
- `/account`: e-mail, senha, foto via perfil e exclusão definitiva com senha/confirmação.
- `/invitations`: fluxo de convites já existente.

A busca de pessoas permite consultar caminhos e solicitar conexões. Não há edição de perfis alheios.
O cliente nunca envia um proprietário ao editar seu perfil. As permissões também
são verificadas no backend; ocultar controles não substitui autorização.

Foto aceita JPEG/PNG de até 2 MiB. O download usa Bearer e gera uma URL de objeto
somente em memória, liberada quando a imagem muda ou o componente é desmontado.
A imagem nunca é buscada por URL pública. O servidor valida pixels, remove
metadados e armazena via GridFS. O arquivo multipart não recebe Content-Type
manual, para preservar o boundary gerado pelo navegador.

Trocar e-mail ou senha encerra todas as sessões e pede novo login. O e-mail novo
precisa ser institucional e exige senha atual, sem confirmação por link. Excluir
conta remove perfil/foto; pesquisas permanecem sem criador e deixam de ser editáveis.
Uma senha atual incorreta mostra erro sem apagar uma sessão ainda válida.

### Verificações

```bash
npm ci
npm test
npm run lint
npm run build
```

Para a validação integrada, prepare o backend e o catálogo conforme o README da
API, use um convite novo, cadastre o perfil, faça login e percorra edição, pesquisa,
foto, troca de senha e exclusão.
Em produção, defina `VITE_API_URL` no build e configure fallback da SPA para
`index.html`. AuthProvider e todos
os serviços usam a mesma sessão persistida. Logout, credenciais alteradas e exclusão
de conta limpam o token e o estado privado; senhas não são persistidas.

### Integração com a main

AuthProvider, telas de perfil e clientes legados compartilham a mesma sessão
persistida em `grafonet.access_token`. A restauração consulta `/auth/me`; 401
limpa a sessão e falhas transitórias mantêm a opção de tentar novamente. As URLs
seguem a main, sem `/api`, preservando também conexões, grafo e busca.

O frontend usa Axios para as requisições HTTP. Para validar as alterações, execute
`npm test`, `npm run lint` e `npm run build`.

## Pessoas, caminhos e orientações

- `/people`: busca por afinidade via `POST /search`, com ordenação por proximidade
  (padrão) ou relevância e paginação de dez resultados. A busca depende dos
  embeddings do backend; perfis aguardando indexação são sinalizados.
- “Solicitar conexão” também está disponível no painel de pessoa do grafo.
  Envia `POST /connections` com `target_user_id`; vínculos aceitos e solicitações
  enviadas/recebidas impedem uma nova solicitação. Conflitos atualizam os vínculos.
  As ações existentes de aceitar, recusar, cancelar e remover continuam em Conexões.
- `/people/:personId/path`: consulta `GET /graph/paths/{id}` e mostra a sequência
  de pessoas, vínculos e número de saltos. Os nomes vêm de `graph.nodes` e as
  arestas são associadas por `steps.edge_id`. Pessoa inexistente e ausência de
  caminho são estados distintos. A tela também abre pelo painel do grafo.
- `/orientations`: exclusiva para professores; consulta
  `GET /research-participations?status=pending|confirmed|rejected`.
  Pendências oferecem confirmação/rejeição via `PATCH /research-participations/{id}`
  com `{ status: "confirmed" | "rejected" }`. O sucesso 204 atualiza a lista.
  O cadastro de participações dos alunos fica fora deste fluxo.

As novas telas usam o cliente Axios e o JWT existentes, sem alterar o contrato
HTTP. Consultas antigas são descartadas e falhas temporárias permitem nova tentativa;
401 encerra a sessão. Os testes usam Vitest, jsdom e React Testing Library, com
serviços simulados nas telas e adaptador Axios simulado nos contratos HTTP.
Não acessam MongoDB, Gemini ou o banco configurado.

A CI (`.github/workflows/checks.yml`) executa instalação pelo lockfile, testes,
lint sem avisos, build TypeScript/Vite e `git diff --check` em pushes e PRs.
Em produção, `/people` e `/orientations` precisam do fallback da SPA; as chamadas
HTTP continuam usando `VITE_API_URL`, sem proxy adicional no Vite.
