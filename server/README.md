# Backend (API + অ্যাডমিন ড্যাশবোর্ড)

Node.js 24 লাগবে। Database হলো SQLite (Node-এর ভেতরেই আছে), আলাদা কিছু install করতে হয় না।
সব data থাকে `data/` ফোল্ডারে: `data/site.db` (লেখা, message, login) আর `data/uploads/` (ছবি)।
এই ফোল্ডার git-এ যায় না, **নিয়মিত backup নিন**।

## নিজের কম্পিউটারে চালানো

```bash
pnpm install
pnpm admin:create you@example.com   # প্রথমবার: অ্যাডমিন account বানায় (password চাইবে)
pnpm server                          # API: http://127.0.0.1:8787
pnpm dev                             # ওয়েবসাইট; /api আর /uploads নিজে থেকে API-তে যায়
```

ড্যাশবোর্ড: `http://localhost:8443/admin`

Password ভুলে গেলে একই `pnpm admin:create you@example.com` আবার চালান, নতুন password সেট হবে।

## Server-এ (VPS) চালানো

```bash
pnpm install --prod=false
pnpm build                           # ওয়েবসাইট build করে dist/ বানায়
pnpm admin:create you@example.com
TRUST_PROXY=1 pnpm start             # ওয়েবসাইট + API একসাথে, port 8787
```

`pm2` বা `systemd` দিয়ে `pnpm start` চালু রাখুন। সামনে Nginx রেখে HTTPS দিন
(production-এ login cookie শুধু HTTPS-এ কাজ করে):

```nginx
server {
  server_name yourdomain.com www.yourdomain.com;
  client_max_body_size 6m;
  location / {
    proxy_pass http://127.0.0.1:8787;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

তারপর `certbot --nginx` দিয়ে ফ্রি HTTPS।

## Settings (environment variables)

| নাম | কাজ | Default |
|---|---|---|
| `API_PORT` | Server-এর port | `8787` |
| `API_HOST` | কোন address-এ শুনবে | `127.0.0.1` |
| `DATA_DIR` | Database আর ছবির ফোল্ডার | `data` |
| `TRUST_PROXY` | Nginx-এর পেছনে থাকলে `1` | — |
| `NODE_ENV` | Server-এ `production` (`pnpm start` নিজেই দেয়) | — |
