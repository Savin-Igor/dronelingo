# Deploy

Stack: Next.js 15 + Prisma + PostgreSQL → Docker → GHCR → Hetzner Cloud + nginx (host).

Auto-deploy: `git tag v* && git push origin v*` → GitHub Actions → Docker build → GHCR → SSH to Hetzner → `docker compose pull + up`.

dronelingo лежит на том же VPS, что MezaData и ALTEKO. Один сервер хостит несколько проектов. У каждого свой порт на хосте, свой каталог в `/opt/`, свой каталог данных в `/mnt/data/`.

> **Статус: pre-development.** Эта документация описывает уже подготовленную инфру. Код приложения ещё не написан. CI и Deploy workflows автоматически пропускаются (`if: hashFiles('package.json') != ''`) пока репо без Node-проекта.

---

## Архитектура deploy

```
git tag v0.1.0 && git push origin v0.1.0
    ↓
GitHub Actions (.github/workflows/deploy.yml)
    ↓  build job: docker buildx → GHCR (ghcr.io/savin-igor/dronelingo:0.1.0 + sha-XXX + latest)
    ↓  deploy job: SSH to Hetzner
    ↓    cd /opt/dronelingo
    ↓    write .env from secrets
    ↓    pre-deploy pg_dump + ротация (хранит 10 последних)
    ↓    docker compose pull app
    ↓    docker compose up -d --remove-orphans
    ↓    wait for /api/health 200 (max 90s)
    ↓    docker image prune -f
    ↓
Hetzner VPS  /opt/dronelingo/
    ├── app (Docker, Next.js)            — port 3030 на хосте → 3000 в контейнере
    ├── db (Docker, postgres:16-alpine)  — данные в /mnt/data/dronelingo/postgres
    └── nginx (host)                     — reverse proxy, HTTPS via Certbot
```

Container entrypoint (`scripts/docker-entrypoint.sh`) при каждом старте:
1. `npx prisma migrate deploy` — применяет миграции (idempotent)
2. `node server.js` — Next.js standalone server

---

## Сервер

| Параметр | Значение |
|----------|----------|
| Provider | Hetzner Cloud, Helsinki |
| План | CX22 (2 vCPU, 4 GB RAM, 40 GB disk) |
| Volume | 20 GB Hetzner Volume на `/mnt/data` |
| OS | Ubuntu 24.04 |
| IP | `89.167.4.195` |
| SSH alias | `palpalych` |
| Domain | `dronelingo.eu` (DNS A → 89.167.4.195) |
| Deploy path | `/opt/dronelingo/` |
| Host port | `127.0.0.1:3030` (loopback only — nginx terminates SSL) |

### Каталоги данных

| Путь | Что лежит |
|------|-----------|
| `/mnt/data/dronelingo/postgres` | PostgreSQL data (Hetzner Volume — переживает rebuild сервера) |
| `/mnt/data/dronelingo/uploads` | Загрузки приложения (если будут) |
| `/mnt/data/dronelingo/backups` | `pg_dump` дампы перед каждым deploy (последние 10, gzip) |

### Port allocation на VPS

| Порт | Проект |
|------|--------|
| 3010 | MezaData |
| 3020 | ALTEKO |
| 3030 | **dronelingo** |
| 3040+ | будущие проекты |

### nginx vhost

Конфиг на сервере: `/etc/nginx/sites-available/dronelingo.eu`.
- 80/443 → Certbot/Let's Encrypt SSL
- `proxy_pass http://127.0.0.1:3030`

---

## GitHub Secrets

`Settings → Secrets and variables → Actions → Secrets`.

| Secret | Что это |
|--------|---------|
| `HETZNER_HOST` | `89.167.4.195` (тот же сервер, тот же ключ что для ALTEKO/MezaData) |
| `HETZNER_USER` | `root` |
| `HETZNER_SSH_KEY` | приватный SSH-ключ для deploy |
| `POSTGRES_PASSWORD` | сильный пароль для production Postgres |
| `NEXTAUTH_SECRET` | `openssl rand -hex 32` |
| `RESEND_API_KEY` | Resend API key (домен dronelingo.eu должен быть verified) |
| `ADMIN_EMAIL` | куда падают уведомления |

`DATABASE_URL` **не** secret — он собирается в deploy-скрипте:
```
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/dronelingo
```

`.env` на сервере перезаписывается каждый deploy. Никогда не редактируй вручную.

Команды для установки секретов:
```bash
gh secret set HETZNER_HOST --body '89.167.4.195'
gh secret set HETZNER_USER --body 'root'
gh secret set HETZNER_SSH_KEY < ~/.ssh/hetzner_palpalych
gh secret set POSTGRES_PASSWORD --body "$(openssl rand -hex 24)"
gh secret set NEXTAUTH_SECRET --body "$(openssl rand -hex 32)"
gh secret set RESEND_API_KEY --body 're_...'
gh secret set ADMIN_EMAIL --body 'admin@dronelingo.eu'
```

---

## Локальная разработка

```bash
# Один раз: скопировать .env.example → .env.local, заполнить
cp .env.example .env.local

# Каждый день
make dev
```

App на `http://localhost:3000` (hot reload). PostgreSQL на `localhost:5434`.
Mailhog — `http://localhost:8026`.

Дев-данные хранятся в `./data/postgres` (git-ignored).

---

## Cut a release

```bash
make release v=0.1.0
# или вручную:
git tag v0.1.0
git push origin v0.1.0
```

Любой тег вида `v*` стартует deploy. Прогресс — в Actions tab.

Версионирование: semver. Patch для багфиксов (`v0.1.1`), minor для фич (`v0.2.0`), major для breaking (`v1.0.0`).

---

## Server management

```bash
ssh palpalych
cd /opt/dronelingo

# Статус контейнеров
docker compose ps

# Логи app
docker compose logs app --tail 50 -f

# Перезапуск только app
docker compose restart app

# Войти в shell контейнера
docker compose exec app sh

# nginx
sudo systemctl status nginx
sudo systemctl reload nginx
```

---

## Manual hotfix (skip CI)

```bash
make deploy DEPLOY_HOST=root@89.167.4.195
```

Pull `latest` и перезапуск только app. **Не делает backup, не ждёт healthcheck** — используй только если знаешь, что делаешь.

---

## Troubleshooting

### App не отвечает / 502 Bad Gateway

```bash
ssh palpalych
cd /opt/dronelingo
docker compose ps
docker compose logs app --tail 100
```

Типичные причины:
- Entrypoint всё ещё гоняет `prisma migrate deploy`
- Неправильный `.env` (e.g. `DATABASE_URL` не совпадает с паролем БД)
- mem_limit 512m выжат → OOM kill. Поднять до `768m` в `docker-compose.yml` и `docker compose up -d --no-deps app`.

### Healthcheck failing

```bash
docker compose exec app wget -qO- http://localhost:3000/api/health
```

Должен вернуть `{"status":"ok","db":"ok",...}`. Если `db:degraded` — проблема с подключением к Postgres.

### Schema drift / failed migration

```bash
docker compose exec app npx prisma migrate deploy
# В крайнем случае (только staging/dev):
docker compose exec app npx prisma db push --accept-data-loss
```

### Disk full

```bash
df -h
du -sh /mnt/data/dronelingo/*
docker image prune -a -f
```

Бэкапы накапливаются в `/mnt/data/dronelingo/backups/`. Deploy-скрипт хранит последние 10.

### SSL certificate

```bash
sudo certbot renew --dry-run
sudo systemctl status certbot.timer
```

### Откат на предыдущую версию

```bash
ssh palpalych
cd /opt/dronelingo
docker images ghcr.io/savin-igor/dronelingo --format '{{.Tag}}' | head -5
# Отредактировать .env: IMAGE_TAG=<previous-version>
docker compose pull app
docker compose up -d --no-deps app
```

---

## Что нужно сделать до первого deploy

1. **Инициализировать Next.js проект** — `npm create next-app@latest`, добавить Prisma, NextAuth, Tailwind. См. соответствующий issue.
2. **DNS A records** для `dronelingo.eu` и `www.dronelingo.eu` → `89.167.4.195`.
3. **GitHub Secrets** — список выше.
4. **Resend domain verification** для `dronelingo.eu`.
5. **Server bootstrap** — `/opt/dronelingo`, `/mnt/data/dronelingo/{postgres,uploads,backups}`, nginx vhost, Certbot. См. issue.
