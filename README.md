
```
Helios
├─ client
│  ├─ .env
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.svg
│  │  └─ icons.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ api
│  │  │  ├─ auth.api.js
│  │  │  └─ axios.js
│  │  ├─ App.jsx
│  │  ├─ assets
│  │  ├─ components
│  │  │  ├─ auth
│  │  │  │  ├─ AuthForm.jsx
│  │  │  │  └─ AuthModeToggle.jsx
│  │  │  ├─ Button.jsx
│  │  │  ├─ Card.jsx
│  │  │  ├─ Input.jsx
│  │  │  ├─ ProtectedRoute.jsx
│  │  │  └─ PublicRoute.jsx
│  │  ├─ constants
│  │  │  └─ auth.constants.js
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  │  ├─ Auth.jsx
│  │  │  ├─ Dashboard.jsx
│  │  │  └─ VerifyOtp.jsx
│  │  ├─ store
│  │  │  └─ authStore.js
│  │  └─ utils
│  │     └─ auth.validation.js
│  └─ vite.config.js
└─ server
   ├─ .env
   ├─ config
   │  ├─ constants.js
   │  ├─ env.js
   │  ├─ google.js
   │  ├─ mail.js
   │  └─ redis.js
   ├─ database
   │  └─ db.js
   ├─ drizzle
   │  ├─ 0000_nervous_deathstrike.sql
   │  └─ meta
   │     ├─ 0000_snapshot.json
   │     └─ _journal.json
   ├─ drizzle.config.js
   ├─ index.js
   ├─ jobs
   │  ├─ queues
   │  │  └─ email.queue.js
   │  └─ workers
   │     └─ email.worker.js
   ├─ middlewares
   │  ├─ auth.middleware.js
   │  └─ validate.middleware.js
   ├─ models
   │  ├─ auth
   │  │  └─ user.model.js
   │  └─ index.js
   ├─ modules
   │  └─ auth
   │     ├─ auth.controller.js
   │     ├─ auth.route.js
   │     └─ auth.service.js
   ├─ package-lock.json
   ├─ package.json
   ├─ shared
   │  └─ services
   │     └─ email.service.js
   ├─ templates
   │  └─ emails
   │     └─ otpEmail.hbs
   ├─ utils
   │  ├─ logger.js
   │  └─ templateRenderer.js
   └─ validators
      └─ auth.validator.js

```