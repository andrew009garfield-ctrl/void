const path = require('path');
const dotenv = require('dotenv');
console.log(__dirname);
dotenv.config({ path: path.join(__dirname, ".env") });
console.log(process.env.GEMINI_API_KEY);
