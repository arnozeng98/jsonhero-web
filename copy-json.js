const fs = require('fs');
const path = require('path');

const sourceFile = path.join(process.cwd(), 'criminal_cases_facts.json');
const destFile = path.join(process.cwd(), 'public', 'criminal_cases_facts.json');

console.log(`Copying from ${sourceFile} to ${destFile}`);

try {
  // 确保目标目录存在
  const destDir = path.dirname(destFile);
  if (!fs.existsSync(destDir)) {
    console.log(`Creating directory: ${destDir}`);
    fs.mkdirSync(destDir, { recursive: true });
  }

  // 读取源文件
  const data = fs.readFileSync(sourceFile);
  console.log(`Read ${data.length} bytes from source file`);

  // 写入目标文件
  fs.writeFileSync(destFile, data);
  console.log(`Successfully wrote ${data.length} bytes to destination file`);
} catch (err) {
  console.error('Error copying file:', err);
} 