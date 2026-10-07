const fs = require('fs');
const path = 'src/lib/firebase.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace('GoogleAuthProvider', 'GoogleAuthProvider, OAuthProvider');
code = code.replace('let googleProvider: GoogleAuthProvider | null = null;', 'let googleProvider: GoogleAuthProvider | null = null;\nlet microsoftProvider: OAuthProvider | null = null;');
code = code.replace('googleProvider = new GoogleAuthProvider();', 'googleProvider = new GoogleAuthProvider();\n    microsoftProvider = new OAuthProvider("microsoft.com");\n    microsoftProvider.setCustomParameters({ prompt: "consent" });');
code = code.replace('export { app, auth, googleProvider, authReady };', 'export { app, auth, googleProvider, microsoftProvider, authReady };');

fs.writeFileSync(path, code);
