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
- `POST /api/auth/register`: recebe `{ "name": "...", "email": "...",
  "password": "...", "invite_token": "..." }` e retorna `{ "id": "...",
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
