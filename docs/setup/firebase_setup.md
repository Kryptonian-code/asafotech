## Firebase Auth Setup

Use this checklist to enable real customer auth for Asafo Tech.

### 1. Create a Firebase project

1. Go to `https://console.firebase.google.com/`
2. Click `Create a project`
3. Name it something like `Asafo Tech`
4. Finish project creation

Official docs:
- https://firebase.google.com/docs/web/setup
- https://firebase.google.com/docs/auth/web/start

### 2. Add a Web app

1. Inside the Firebase project, click the Web icon `</>`
2. Register the app
3. Copy the Firebase config values shown

You will need:
- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`

Your current Asafo Tech values are already placed into:
- [`.env`](C:\xampp\htdocs\e-commerce\.env)
- [`.env.production`](C:\xampp\htdocs\e-commerce\.env.production)

`measurementId` is not needed for customer auth, so it is not used by the app right now.

### 3. Enable Authentication

1. In the left sidebar, open `Build` -> `Authentication`
2. Click `Get started`
3. In `Sign-in method`, enable:
- `Email/Password`
- `Google`

For Google:
1. Open the Google provider
2. Click `Enable`
3. Choose a support email
4. Save

### 4. Add authorized domains

In Firebase Authentication settings, make sure these are allowed:
- `localhost`
- `10.220.145.192`

If you later deploy to a real domain, add that too.

### 5. Fill your env files

Paste the Firebase config values into both:
- `.env`
- `.env.production`

Example:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

### 6. Restart and rebuild

For dev:

```sh
npm run dev
```

For the Apache/XAMPP version:

```sh
npm run build
```

### 7. Test the flow

1. Open `/account/login?mode=register`
2. Create an account
3. Check your email
4. Click the verification link
5. Return and sign in
6. Test `Continue with Google`

### Notes

- Customer auth is now handled by Firebase.
- Admin auth is still your local PHP/MySQL admin login.
- Email/password customers must verify their email before login is allowed.
