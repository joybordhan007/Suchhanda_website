# cPanel-এ ওয়েবসাইট আর backend চালু করা

cPanel-এর **Setup Node.js App** (Phusion Passenger) দিয়ে পুরো সাইট চলে: ওয়েবসাইট, অ্যাডমিন ড্যাশবোর্ড আর API, একটা app হিসেবেই।

> **`package.json` থেকে `"type": "module"` মুছবেন না।** Server-এর code ES module; ওই লাইন মুছলে server একদমই চলবে না। cPanel-এর জন্য যা দরকার তা `app.cjs` ফাইলে করা আছে।

## ১. নিজের কম্পিউটারে release বানান

```bash
pnpm build:release
```

এতে `release/` ফোল্ডার তৈরি হয়। এর **ভেতরের সব কিছু** zip করুন (`release` ফোল্ডারটা নিজে না, ভেতরের ফাইলগুলো):

```
app.cjs   package.json   server/   dist/   DEPLOY-CPANEL.md
```

## ২. cPanel-এ app তৈরি করুন

cPanel → **Setup Node.js App** → **Create Application**:

| ঘর | কী দেবেন |
|---|---|
| Node.js version | **22.x** বা **20.x** (তালিকার সবচেয়ে নতুনটা; ২০-এর নিচে চলবে না) |
| Application mode | **Production** |
| Application root | যেমন `suchhanda-app` (`public_html`-এর **বাইরে**) |
| Application URL | আপনার domain |
| Application startup file | **`app.cjs`** |

**Environment variables** (Add Variable):

| নাম | মান |
|---|---|
| `TRUST_PROXY` | `1` |
| `DATA_DIR` | `/home/আপনার-cpanel-username/suchhanda-data` |

`DATA_DIR` দিলে database আর ছবি app ফোল্ডারের বাইরে থাকে, ফলে পরে নতুন release আপলোড করলে data মুছে যায় না।

**Create** চাপুন।

## ৩. ফাইল আপলোড

1. **File Manager** → Application root ফোল্ডারে (`suchhanda-app`) যান।
2. zip আপলোড করে **Extract** করুন। ফোল্ডারে সরাসরি `app.cjs`, `package.json`, `server/`, `dist/` থাকতে হবে।
3. **Setup Node.js App**-এ ফিরে আপনার app-এ **Run NPM Install** চাপুন।

## ৪. আগের লেখা, ছবি আর অ্যাডমিন account নিয়ে যান

নিজের কম্পিউটারে `pnpm server` বন্ধ করে `data/` ফোল্ডারের ভেতরের সব (`site.db` এবং থাকলে `site.db-wal`, `site.db-shm`, আর `uploads/`) `DATA_DIR`-এর ফোল্ডারে (`suchhanda-data`) আপলোড করুন। তাহলে সব service, blog, ছবি আর login আগের মতোই থাকবে।

নতুন করে অ্যাডমিন বানাতে চাইলে: Node.js App পেজের উপরে যে **"Enter to the virtual environment"** command দেখায় সেটা cPanel **Terminal**-এ চালান, তারপর:

```bash
npm run admin:create -- you@example.com
```

## ৫. চালু করুন

**Setup Node.js App** → **Restart**। তারপর ব্রাউজারে domain খুলুন, আর `/admin`-এ login করুন।

## ৫০৩ বা অন্য error এলে

1. File Manager-এ app ফোল্ডারে **`startup-error.log`** খুলুন: server কেন চালু হয়নি তা লেখা থাকে। cPanel-এর `stderr.log`-ও দেখুন।
2. সাধারণ কারণ:

| লগে যা লেখা | সমাধান |
|---|---|
| `No SQLite driver` | **Run NPM Install** আবার চাপুন, অথবা Node.js **22.13+** বেছে নিন |
| `Cannot find package 'hono'` | **Run NPM Install** চাপুন |
| `Website build not found` | `dist/` ফোল্ডার আপলোড হয়নি; আবার আপলোড করুন |
| `EACCES` / permission | `DATA_DIR`-এর ফোল্ডার আপনার home-এর ভেতরে আছে কিনা দেখুন |
| লগ ফাইলই নেই | Startup file `app.cjs` লেখা আছে কিনা আর Node.js ২০ বা নতুন কিনা দেখুন |

3. প্রতিবার কিছু বদলালে **Restart** চাপুন।

## পরে update করা

`pnpm build:release` → zip → app ফোল্ডারে আপলোড করে **overwrite** → **Run NPM Install** → **Restart**। `DATA_DIR` আলাদা থাকায় লেখা আর ছবি নিরাপদ থাকে।
