# cPanel-এ ওয়েবসাইট আর অ্যাডমিন ড্যাশবোর্ড চালু করা

একই code দিয়ে cPanel-এর **Setup Node.js App**-এ দুটো app চলবে:

| App | ঠিকানা | কাজ |
|---|---|---|
| ওয়েবসাইট | `suchhandamondol.com` | সবার জন্য সাইট; `/admin` খুললে অ্যাডমিন subdomain-এ পাঠিয়ে দেয় |
| অ্যাডমিন | `admin.suchhandamondol.com` | অ্যাডমিন ড্যাশবোর্ড; Google-এ দেখায় না |

দুটো app একই `DATA_DIR` ব্যবহার করে, তাই ড্যাশবোর্ডে কিছু save করলে সাথে সাথে সাইটে দেখা যায়।

> **`package.json` থেকে `"type": "module"` মুছবেন না।** cPanel-এর জন্য যা দরকার তা `app.cjs` ফাইলে করা আছে।

## ১. নিজের কম্পিউটারে release বানান

```bash
pnpm build:release
```

`release/` ফোল্ডারের **ভেতরের সব কিছু** zip করুন (`app.cjs`, `package.json`, `server/`, `dist/`)।

## ২. SSL চেক করুন

cPanel → **SSL/TLS Status** → `suchhandamondol.com`, `www.suchhandamondol.com` আর `admin.suchhandamondol.com` তিনটাতেই সবুজ তালা থাকতে হবে। না থাকলে **Run AutoSSL** চাপুন (কয়েক মিনিট লাগে)। HTTPS ছাড়া অ্যাডমিন login কাজ করবে না।

## ৩. Data ফোল্ডার তৈরি করুন

**File Manager** → home (`/home/suchhand`) → **+ Folder** → নাম `suchhanda-data`।

নিজের কম্পিউটারে `pnpm server` বন্ধ করে `data/` ফোল্ডারের ভেতরের সব (`site.db`, থাকলে `site.db-wal`, `site.db-shm`, আর `uploads/` ফোল্ডার) এই `suchhanda-data` ফোল্ডারে আপলোড করুন। এতে সব service, blog, ছবি আর অ্যাডমিন login আগের মতো থাকবে।

## ৪. ওয়েবসাইট app

cPanel → **Setup Node.js App** → **Create Application**:

| ঘর | কী দেবেন |
|---|---|
| Node.js version | তালিকার সবচেয়ে নতুনটা (**22.x**, না থাকলে **20.x**) |
| Application mode | **Production** |
| Application root | `suchhanda-site` |
| Application URL | `suchhandamondol.com` (পাশের ঘর ফাঁকা) |
| Application startup file | `app.cjs` |

**Environment variables** (Add Variable):

| নাম | মান |
|---|---|
| `TRUST_PROXY` | `1` |
| `DATA_DIR` | `/home/suchhand/suchhanda-data` |
| `ADMIN_URL` | `https://admin.suchhandamondol.com` |
| `SITE_URL` | `https://suchhandamondol.com` |

**Create** চাপুন। তারপর:

1. **File Manager** → `/home/suchhand/suchhanda-site` → zip আপলোড → **Extract**। ফোল্ডারে সরাসরি `app.cjs`, `package.json`, `server/`, `dist/` থাকতে হবে।
2. **Setup Node.js App**-এ এই app-এর **Edit** (পেনসিল) → **Run NPM Install** → **Restart**।

## ৫. অ্যাডমিন app

আবার **Create Application**:

| ঘর | কী দেবেন |
|---|---|
| Node.js version | ওয়েবসাইট app-এর মতোই |
| Application mode | **Production** |
| Application root | `suchhanda-admin` |
| Application URL | `admin.suchhandamondol.com` (পাশের ঘর ফাঁকা) |
| Application startup file | `app.cjs` |

**Environment variables**:

| নাম | মান |
|---|---|
| `TRUST_PROXY` | `1` |
| `DATA_DIR` | `/home/suchhand/suchhanda-data` (ওয়েবসাইটের সাথে **একই**) |
| `ADMIN_URL` | `https://admin.suchhandamondol.com` |
| `SITE_URL` | `https://suchhandamondol.com` |

দুটো app-এর variable হুবহু একই। কোন domain থেকে request এসেছে দেখে server নিজেই বোঝে সেটা ওয়েবসাইট নাকি অ্যাডমিন।

**Create** → একই zip `/home/suchhand/suchhanda-admin`-এ আপলোড করে **Extract** → **Run NPM Install** → **Restart**।

## ৬. পরীক্ষা

- `https://suchhandamondol.com`: সাইট খুলবে।
- `https://suchhandamondol.com/admin`: অ্যাডমিন subdomain-এ চলে যাবে।
- `https://admin.suchhandamondol.com`: login পেজ। login করে কিছু বদলে Save করুন, তারপর সাইটে দেখুন।
- Contact form থেকে একটা message পাঠিয়ে ড্যাশবোর্ডের Messages-এ দেখুন।

নতুন অ্যাডমিন বানাতে চাইলে: Node.js App পেজের উপরে যে **"Enter to the virtual environment"** command দেখায় সেটা cPanel **Terminal**-এ চালান, তারপর:

```bash
npm run admin:create -- you@example.com
```

## ৫০৩ বা অন্য error এলে

1. File Manager-এ app ফোল্ডারে **`startup-error.log`** খুলুন: server কেন চালু হয়নি তা লেখা থাকে। cPanel-এর `stderr.log`-ও দেখুন।
2. সাধারণ কারণ:

| লগে যা লেখা | সমাধান |
|---|---|
| `Cannot find package 'hono'` বা `'node-sqlite3-wasm'` | **Run NPM Install** চাপুন |
| `database is locked` | দুটো app-ই **Restart** করুন |
| `Website build not found` | `dist/` ফোল্ডার আপলোড হয়নি; আবার আপলোড করুন |
| `EACCES` / permission | `DATA_DIR`-এর ফোল্ডার `/home/suchhand`-এর ভেতরে আছে কিনা দেখুন |
| লগ ফাইলই নেই | Startup file `app.cjs` লেখা আছে কিনা আর Node.js ২০ বা নতুন কিনা দেখুন |

3. Login-এ "Cross-site request blocked" এলে: ওই app-এ `TRUST_PROXY` = `1` আছে কিনা দেখুন।
4. প্রতিবার কিছু বদলালে **Restart** চাপুন।

## পরে update করা

`pnpm build:release` → zip → **দুটো** app ফোল্ডারেই আপলোড করে overwrite → দুটোতেই **Run NPM Install** → **Restart**। Data আলাদা ফোল্ডারে থাকায় লেখা আর ছবি নিরাপদ থাকে।

**Backup:** মাঝে মাঝে `/home/suchhand/suchhanda-data` ফোল্ডার zip করে download করে রাখুন। সব লেখা, ছবি আর message এখানেই থাকে।
