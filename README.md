# GrafoNet — frontend

Frontend React + TypeScript para autenticação e convites do GrafoNet.

## Executar

Configure a URL da API no arquivo `.env` desta pasta:

```env
API_BASE_URL=http://localhost:5000
```

Depois inicie o frontend:

```powershell
npm ci
npm run dev
```

O Vite encaminha `/api` e `/health` para a API indicada por `API_BASE_URL`.

## Endpoints esperados

- `POST /api/auth/login`: recebe `{ "email": "...", "password": "..." }`,
  retorna `{ "access_token": "...", "user": { "id": "...", "email": "..." } }`.
  O JWT é enviado às rotas protegidas pelo header `Authorization: Bearer`.
- `GET /api/auth/me`: retorna `{ "id": "...", "email": "..." }` para uma sessão
  válida e HTTP 401 quando não há sessão.
- `POST /api/auth/logout`: encerra e revoga o JWT atual.
- `POST /api/auth/register`: recebe `{ "profile": { "name": "...",
  "course_id": "...", "semester": 1, "field_id": "...", "bio": "..." },
  "email": "...", "password": "...", "invite_token": "..." }` e retorna `{ "id": "...",
  "email": "..." }`. O token é lido do parâmetro `?token=...` da URL.
- `POST /api/invitations`: recebe `{ "email": "..." }` de um usuário autenticado,
  envia o convite por e-mail e retorna os dados públicos do convite. O link de
  cadastro usa `/register?token=...`.

O JWT é mantido somente em memória pelo frontend: não é gravado em
`localStorage` ou `sessionStorage` e é perdido ao recarregar a página. O token
do convite é enviado somente na requisição de cadastro; após o cadastro, o
parâmetro é removido da URL. Senhas e tokens não são registrados no console.
O backend valida convites e e-mails institucionais e aplica as regras de senha.

## Verificações

```powershell
npm run lint
npm run build
```

## Perfil e configurações da conta

O cadastro envia `profile` com `name`, `course_id`, `semester`, `field_id` e `bio`.
Cursos e áreas vêm de `GET /api/auth/profile-options`; semestre é de 1 a 8. Não há
campo de interesses. Nome e dados pessoais pertencem ao perfil, não ao usuário.

As funcionalidades novas ficam em `src/modules/auth`:

- `/`: entrada autenticada com acesso às funcionalidades; homepage definitiva pendente.
- `/profile`: somente o próprio perfil, foto e experiências.
- `/profile/edit`: nome, curso, semestre, área e bio.
- `/profile/experiences`: seleção de entidades e iniciação científica; aparece como
  etapa opcional após o primeiro login. Pular ou salvar persiste sua conclusão.
- `/research-projects`: pesquisas compartilhadas; criar e editar pelo criador.
- `/account`: e-mail, senha, foto via perfil e exclusão definitiva com senha/confirmação.
- `/invitations`: fluxo de convites já existente.

Não há lista/busca de pessoas nem endereço para acessar perfil de outro usuário.
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

Os testes usam Vitest, jsdom e React Testing Library. Cobrem cadastro completo,
contratos HTTP/Bearer/multipart, perfil, etapa opcional, pesquisas, configurações,
fotos, tratamento de sessão expirada e ausência de consulta de perfis alheios.

Para a validação integrada, prepare o backend e o catálogo conforme o README da
API, use um convite novo, cadastre o perfil, faça login e percorra edição, pesquisa,
foto, troca de senha e exclusão. O Vite encaminha `/api` ao backend configurado.
Em produção, configure fallback da SPA para `index.html` nas rotas do frontend,
preservando `/api` para o backend. JWT continua somente em memória; recarregar a
página exige login, conforme o fluxo de autenticação existente.

Validação em 27/10/2026: **18 testes frontend passaram**, `npm run lint` sem avisos
e `npm run build` concluído. O backend passou em 130 testes com MongoDB real isolado.
