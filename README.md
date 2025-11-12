# bip-teste-integrado

Perfeito — te deixo um **README.md** pronto pra colar na raiz do repo (🌲 `BIP-TESTE-INTEGRADO/README.md`). Ele documenta o que foi feito, como subir **DB (Docker)**, **backend (Spring Boot)** e **frontend (Angular)**, além de exemplos de uso.

---

# 🏗️ BIP – Desafio Fullstack Integrado

Solução fullstack com **DB + EJB + Backend Spring Boot + Frontend Angular**.
Inclui correção de bug na transferência do EJB/serviço de benefícios, CRUD completo no backend e app Angular consumindo a API.

## 📦 Stack

* **DB**: PostgreSQL
* **EJB / domínio**: módulo `ejb-module` (serviço de domínio; bug da transferência corrigido no service do backend)
* **Backend**: Spring Boot (JPA, Validation)
* **Frontend**: Angular standalone + HttpClient + Router
* **Dev tooling**: Docker Compose (DB), Proxy do Angular para evitar CORS

---

## ✅ O que foi implementado

### Backend (`backend-module/demo`)

* CRUD completo de **Benefício**:

  * `GET /api/beneficios` (lista)
  * `GET /api/beneficios/{id}`
  * `POST /api/beneficios`
  * `PUT /api/beneficios/{id}`
  * `DELETE /api/beneficios/{id}`
* Transferência com **validação e locking**:

  * Endpoint: `POST /api/beneficios/transfer` `{ fromId, toId, amount }`
  * Lógica em `BeneficioService#transfer(...)`

    * valida `amount > 0`
    * **pessimistic write lock** via `BeneficioRepository#findForUpdate`
    * verifica ativo/origem/destino e **saldo suficiente**
    * transação com rollback em caso de erro
* Mapeamentos/DTO/Handlers:

  * `BeneficioDTO`, `BeneficioMapper`
  * `RestExceptionHandler` (erros 400/404/500 padronizados)

### Frontend (`frontend`)

* **Lista de Benefícios** com:

  * loading/skeleton, estado de erro com retry, empty state
  * tabela com valor em BRL, badge de status e ações (Editar/Excluir)
  * **Transferência** entre benefícios (form simples)
* **Form de Benefício** (criar/editar) com validações
* **Proxy** Angular usando `environment.apiUrl = '/api'` (zero CORS em dev)

---

## 🗂️ Estrutura (simplificada)

```
BIP-TESTE-INTEGRADO
├─ db/                  # schema.sql e seed.sql
├─ ejb-module/          # módulo EJB/domínio (bug tratado no service do backend)
├─ backend-module/
│  └─ demo/
│     └─ src/main/java/com/example/demo/...
├─ frontend/
│  └─ src/...
├─ docker-compose.yml    # PostgreSQL (ajuste portas/credenciais se necessário)
└─ README.md
```

---

## 🚀 Como rodar

### 0) Pré-requisitos

* **Docker** e **Docker Compose**
* **Java 17+** e **Maven** *ou* **Gradle** (use o que existir no projeto)
* **Node 18+** e **npm**

> Dica: confira as portas no `docker-compose.yml`. O backend usa `8080`; o Angular usa `4200`.

---

### 1) Subir o banco via Docker

Na raiz do projeto:

```bash
docker compose up -d
# ou: docker-compose up -d
```

Aplique schema e seed (ajuste nomes conforme seu compose; abaixo assume serviço `db`, DB `bip`, usuário/senha `postgres`):

```bash
# schema
docker exec -i db psql -U postgres -d bip < db/schema.sql
# seed
docker exec -i db psql -U postgres -d bip < db/seed.sql
```

> Se o serviço do Postgres no compose tiver outro nome, substitua `db` pelo nome correto.
> Se você mapeou porta 5432 -> 5432, pode usar um cliente (DBeaver/psql local) e rodar os `.sql`.

---

### 2) Rodar o Backend (Spring Boot)

Entre em `backend-module/demo`:

**Maven (se existir `mvnw`/`pom.xml`):**

```bash
./mvnw spring-boot:run
# ou: mvn spring-boot:run
```

**Gradle (se existir `gradlew`/`build.gradle`):**

```bash
./gradlew bootRun
```

A API ficará em:
`http://localhost:8080/api/beneficios`

**Exemplos rápidos (curl):**

```bash
# listar
curl http://localhost:8080/api/beneficios

# criar
curl -X POST http://localhost:8080/api/beneficios \
  -H "Content-Type: application/json" \
  -d '{"nome":"Beneficio X","descricao":"Teste","valor":1200.00,"ativo":true}'

# atualizar
curl -X PUT http://localhost:8080/api/beneficios/1 \
  -H "Content-Type: application/json" \
  -d '{"id":1,"nome":"Beneficio A+","descricao":"Editado","valor":1500.00,"ativo":true}'

# excluir
curl -X DELETE http://localhost:8080/api/beneficios/2

# transferir
curl -X POST http://localhost:8080/api/beneficios/transfer \
  -H "Content-Type: application/json" \
  -d '{"fromId":1,"toId":3,"amount":100.00}'
```

###  2.1) Testes do Backend

Estrutura dos testes

Coloque os arquivos de teste em:
backend-module/demo/src/test/java/com/example/demo/service/

Ex.: backend-module/demo/src/test/java/com/example/demo/service/BeneficioServiceTest.java

Dependências (Gradle)
No backend-module/demo/build.gradle, garanta:

dependencies {
  // ...
  testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

test {
  useJUnitPlatform()
}


Como rodar

Dentro de backend-module/demo:

./gradlew clean test


Rodar apenas o teste de service:

./gradlew test --tests "com.example.demo.service.BeneficioServiceTest"


Abrir o relatório:

open build/reports/tests/test/index.html

🩺 Troubleshooting (Testes)

“package org.junit.jupiter.api does not exist”
Você provavelmente colocou o teste em src/main/java.
Mova para src/test/java e rode ./gradlew clean test novamente.

---

### 3) Rodar o Frontend (Angular)

Entre em `frontend`:

```bash
npm install
```

Crie **proxy.conf.json** (na pasta `frontend`) caso ainda não exista:

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

Garanta que o **environment dev** use caminho relativo:

```ts
// frontend/src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: '/api'
};
```

Suba o app:

```bash
npm start
# ou:
ng serve --open --proxy-config proxy.conf.json
```

Acesse: `http://localhost:4200`
Rota principal: `/beneficios`

### 3.1) Testes do Frontend

Estrutura dos testes

Os testes ficam junto aos componentes, em arquivos *.spec.ts.

Exemplo:

frontend/src/app/features/beneficios/beneficios-list.component.spec.ts
frontend/src/app/core/services/beneficio.service.spec.ts


Como rodar os testes

Na pasta frontend:

npm run test


Isso executa o Jest com o preset jest-preset-angular configurado em jest.config.cjs.

Outros comandos úteis

npm run test:watch   # modo contínuo (útil para desenvolvimento)
npm run test:cov     # executa e gera relatório de cobertura


Relatórios

O Jest mostra o resultado no terminal.
Se quiser cobertura em HTML, abra:

frontend/coverage/lcov-report/index.html


✅ Onde adicionar:
Logo após o bloco atual de “3) Rodar o Frontend (Angular)”, antes da seção “🔧 Notas de implementação”.

---

## 🔧 Notas de implementação

* **Transferência segura**: `BeneficioService#transfer` usa **`findForUpdate`** com `@Lock(PESSIMISTIC_WRITE)` para travar linhas de origem/destino durante a transação, valida ativo/saldo e faz rollback em erro.
* **Controle de versão**: `@Version` em `Beneficio` habilita **optimistic locking** para updates concorrentes (via JPA).
* **Tratamento de erros REST**: `RestExceptionHandler` padroniza mensagens (400/404/500).
* **Frontend**:

  * Lista com loading/erro/empty e **UX mais limpa** (botões, badges, skeleton).
  * Form reativo com validações de `nome`, `descricao`, `valor`, `ativo`.
  * **Proxy** evita CORS e permite usar `environment.apiUrl = '/api'` em dev.

---

## 🧪 Testes (sugestões)

* **Backend**: teste de serviço para `transfer` cobrindo casos de:

  * valor inválido (<= 0)
  * benefício inativo
  * saldo insuficiente
  * corrida de concorrência (pelo menos cenário feliz sob PESSIMISTIC_WRITE)
* **Frontend**: teste de componente para render da lista (loading → dados), estado vazio e handler de erro.

---

## 🗺️ Endpoints resumidos

```
GET    /api/beneficios
GET    /api/beneficios/{id}
POST   /api/beneficios
PUT    /api/beneficios/{id}
DELETE /api/beneficios/{id}
POST   /api/beneficios/transfer   { fromId, toId, amount }
```

**Modelo (DTO):**

```json
{
  "id": 1,
  "nome": "Beneficio A",
  "descricao": "Descrição A",
  "valor": 1000.00,
  "ativo": true,
  "version": 0
}
```

---

## 🩺 Troubleshooting

* **Frontend não lista nada**:

  * Confira o **Network**: `GET /api/beneficios` deve retornar 200.
  * Garanta `environment.ts` com `apiUrl: '/api'` e **proxy.conf.json** ativo no `ng serve`.
* **CORS no backend**:

  * Rodando com proxy correto não deve ocorrer. Se acessar o backend direto de outra origem, habilite CORS no Spring.
* **DB não sobe**:

  * `docker compose logs -f db`
  * Verifique porta 5432, usuário/senha e nome do banco (padrão usado aqui: `bip`).
* **Erro de saldo/transferência**:

  * Verifique se `fromId` tem saldo ≥ `amount` e ambos estão `ativo = true`.

---

## 📜 Licença

Uso público para o desafio técnico.
