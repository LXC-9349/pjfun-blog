import { createHash } from 'crypto';

// 获取命令行参数
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: node generate-password-hash.js <password>');
  process.exit(1);
}

const password = args[0];
const hash = createHash('sha256').update(password).digest('hex');

console.log(`Password hash: ${hash}`);
console.log(`Add this to your .env file:`);
console.log(`VITE_BLOG_PASSWORD_HASH=${hash}`);