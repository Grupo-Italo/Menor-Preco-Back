# Menor-Preco-Back

API backend que integra com a API do Nota Paraná para buscar ofertas de produtos, filtrar resultados por raio e persistir ofertas no banco de dados.

Resumo
- Busca produtos via Nota Paraná (serviço externo)
- Filtra resultados opcionalmente por `raio` (metros) usando o campo `distkm` retornado
- Persiste ofertas no banco Postgres quando a busca é feita por `gtin` (após aplicar o filtro de raio)

Principais pontos de comportamento
- A rota exposta é montada em `/nota-parana/search`.
- Parâmetros de query suportados:
  - `local` (string) — código da localidade/base
  - `gtin` (string) — quando presente, o backend grava os produtos retornados
  - `termo` (string) — busca por termo (nome do produto)
  - `raio` (number, metros) — quando fornecido, filtra produtos cujo `distkm * 1000 <= raio`
- Gravação no banco só acontece quando `gtin` foi usado na query e somente para os produtos que passaram pelo filtro de `raio` (se aplicado).

Banco de dados
- Usa PostgreSQL via `pg` (pool em `db.js`).
- Tabela esperada: `dadosbi.menorpreco_ofertas`.
- Colunas esperadas (inseridas pelo backend):
  - `gtin`, `produto_desc`, `ncm`, `valor`, `valor_tabela`, `datahora`, `distkm`,
    `estabelecimento_codigo`, `estabelecimento_nome`, `municipio`, `uf`, `nrdoc`, `fetched_at`
- Há um constraint `NOT NULL` em `gtin` (e a aplicação filtra registros sem `gtin` antes de inserir).
- Chave única usada no UPSERT: `(gtin, estabelecimento_codigo, nrdoc)` — se a combinação já existir, o registro é atualizado.

Instalação
1. Clone o projeto e entre na pasta:

```bash
git clone <repo>
cd menor-preco-back
```

# Menor-Preco-Back

API backend para integração com o serviço Nota Paraná: busca ofertas de produtos, aplica filtros (opcional) e persiste resultados relevantes no banco de dados.

Visão geral
- Busca produtos na API externa (Nota Paraná) usando parâmetros de query.
- Filtra localmente por distância quando o parâmetro `raio` (em metros) é fornecido.
- Persiste resultados no banco apenas quando a busca for por `gtin`.

Comportamento das rotas
- `GET /nota-parana/search`
  - Query params suportados: `local`, `gtin`, `termo`, `raio` (metros).
  - Se `raio` for enviado, os produtos retornados pela API externa são filtrados pelo campo `distkm` (km → m).
  - Se `gtin` for enviado, os produtos (após filtro) são persistidos via UPSERT.

- `GET /products` — retorna registros persistidos.
- `POST /products/bulk` — insere/atualiza em massa (recebe array de objetos compatíveis).

Persistência
- Usa PostgreSQL via `pg` (pool definido em `db.js`).
- Tabela esperada: `dadosbi.menorpreco_ofertas`.
- A aplicação evita inserir registros sem `gtin` para não violar constraints.
- UPSERT baseado na combinação `(gtin, estabelecimento_codigo, nrdoc)`.

Instalação (genérico)
1. Obtenha este repositório internamente.
2. Instale dependências:

```bash
npm install
```

3. Configure a conexão com o banco conforme o arquivo `db.js` (não coloque segredos no README).

4. Inicie o servidor (ex.: definir `PORT` via variável de ambiente):

```bash
export PORT=3000
node ./server.js
```

Exemplos de uso (genéricos)
- Buscar por termo com raio (retorna apenas produtos dentro do raio especificado):

```bash
curl "http://localhost:3000/nota-parana/search?local=<LOCAL_CODE>&termo=<TEXTO>&raio=1000"
```

- Buscar por GTIN (retorna e grava no banco, após filtro por raio se enviado):

```bash
curl "http://localhost:3000/nota-parana/search?local=<LOCAL_CODE>&gtin=<GTIN>&raio=1000"
```

Observações
- O backend converte `distkm` (km) retornado pela API externa para metros antes de comparar com `raio`.
- Mantenha credenciais e strings de conexão fora de arquivos públicos e fora deste README.
- Se a API externa alterar nomes de campos, ajuste o mapeamento em `controllers/notaParanaController.js`.

Teste rápido
- Use `curl` ou o frontend para chamar as rotas e verifique os resultados. Para inspecionar o banco, use queries SQL locais (não inclua credenciais aqui).
