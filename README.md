# AutoShine · Gestão de Estética Automotiva

ERP leve para estética automotiva: balcão e pátio (lista e Kanban), clientes, estoque de insumos, fechamento de caixa, dashboard com comissões, portal do cliente e **Painel Administrativo** (serviços, placeholders, marcas e cores).

- **Front-end:** React + `htm` via CDN (sem build), servido pelo próprio servidor.
- **Back-end:** Node.js + Express, com dados em `data.json`.

## Requisitos

- Node.js **20.6 ou superior** (https://nodejs.org, versão LTS)

## Como rodar

```bash
npm install
npm start
```

Abra o endereço mostrado no terminal (por padrão `http://localhost:3000`).
Use **sempre** esse endereço. Abrir o `index.html` direto ou pelo Live Server do VS Code não funciona, porque o login depende da API.

### Windows / PowerShell

- Se o `npm` for bloqueado ("execução de scripts desabilitada"), rode uma vez:
  `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
  (ou use `npm.cmd install` e `npm.cmd start`).
- No PowerShell antigo, use um comando por linha (não existe `&&`).
- Para parar o servidor: `Ctrl + C`.

## Configuração (`.env`)

Copie `.env.example` para `.env` e preencha:

| Variável | Descrição |
|---|---|
| `JWT_SECRET` | Segredo da sessão, aleatório, com 32+ caracteres. Gere com `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Criam o Gerente inicial **somente na primeira execução** (senha com 8+ caracteres) |
| `NODE_ENV` | `development` para `http://localhost`; `production` quando estiver atrás de HTTPS |
| `PORT` | Porta do servidor (padrão 3000) |

Nunca publique o `.env` nem o `data.json` (adicione ambos ao `.gitignore`).

## Perfis de acesso

| Perfil | Acesso |
|---|---|
| **Gerente** | Tudo: balcão, dashboard, clientes, estoque, caixa, painel administrativo e gestão de usuários. **Só ele altera preços e exclui serviços** |
| **Operador** | Balcão/pátio, clientes, estoque e painel administrativo (cria/edita serviços sem mexer em preço; gerencia placeholders, marcas e cores) |
| **Cliente** | Portal: só os próprios veículos, serviços em andamento, histórico e comprovantes |

- O cadastro pela tela de login cria **sempre** um Cliente.
- Acessos da equipe são criados pelo Gerente na aba **Usuários**, onde também é possível alterar o perfil e bloquear contas.
- Para trocar a senha do gerente inicial: crie um novo Gerente, entre com ele e bloqueie o antigo.

## Painel Administrativo

- **Serviços:** nome, descrição e preço base. Preço e exclusão (com confirmação) são exclusivos do Gerente; o servidor responde `403` (`FORBIDDEN_PRICE`) a quem tentar. No balcão, o preço de cada serviço é recalculado no servidor (preço base × categoria do veículo) para o Operador.
- **Placeholders:** textos dos campos do formulário de atendimento. Chaves em uso: `ops.name`, `ops.phone`, `ops.model`, `ops.plate`, `ops.obs`.
- **Marcas e Cores:** alimentam os menus suspensos do formulário de atendimento.
- **Placa:** maiúscula automática, 7 caracteres, formato `ABC1D23` ou `ABC1234` (validada no navegador e no servidor).

## Estrutura

```
server.js         API, autenticação e regras de negócio
admin.js          rotas e controllers do Painel Administrativo (/api/admin)
data.json         banco de dados (criado na 1ª execução)
public/
  index.html
  app.js          interface (React + htm)
  styles.css      estilos e impressão térmica 80mm/58mm
```

## API (resumo)

| Rota | Quem acessa |
|---|---|
| `POST /api/auth/register`, `/login`, `/logout`; `GET /api/auth/me` | público / logado |
| `GET /api/data` | logado (filtrado por perfil) |
| `POST /api/orders`, `PATCH /api/orders/:id` | gerente, operador |
| `PATCH /api/inventory/:id` | gerente, operador |
| `POST /api/closures` | gerente |
| `GET/POST/PATCH /api/users` | gerente |
| `GET/POST/PUT /api/admin/services` | gerente, operador (preço só gerente) |
| `DELETE /api/admin/services/:id` | gerente |
| `/api/admin/placeholders`, `/brands`, `/colors` | gerente, operador |

## Segurança

- Senhas com hash (bcrypt); sessão em cookie `httpOnly` + `SameSite=Strict`.
- Permissões validadas no servidor; o cliente só recebe os próprios dados.
- Limite de tentativas de login, headers de segurança (`helmet`) e log de auditoria em `data.json`.
- O fechamento de caixa e o desconto de estoque são calculados no servidor.

## Publicando na internet

1. Rode atrás de HTTPS (Nginx, Caddy ou Cloudflare) e use `NODE_ENV=production`.
2. Faça **backup** periódico do `data.json`.
3. Para maior volume ou várias instâncias, migre o armazenamento para SQLite ou PostgreSQL.
4. Compile o Tailwind (hoje vem por CDN, o que exige `'unsafe-eval'` na CSP) e remova essa permissão.

## Problemas comuns

| Sintoma | Causa e solução |
|---|---|
| `EADDRINUSE ... :3000` | Porta ocupada. Mude `PORT` no `.env` (ex.: 3001) ou encerre o outro processo |
| "Erro 405" no login | A página não está vindo do servidor Node. Acesse `http://localhost:PORTA` |
| Login não funciona em `production` | Cookie seguro exige HTTPS. Em localhost use `NODE_ENV=development` |
| Esqueci a senha do gerente (sem dados importantes) | Apague `data.json` e reinicie: ele é recriado com `ADMIN_EMAIL`/`ADMIN_PASSWORD` do `.env` (**apaga todos os dados**) |
| `node` ou `npm` não reconhecido | Instale o Node.js LTS e reabra o terminal |

## Ainda não implementado

Recuperação de senha por e-mail, troca de senha pela interface, confirmação de e-mail, edição de taxas de comissão, cadastro de produtos de estoque e consumo de insumos para serviços novos.
