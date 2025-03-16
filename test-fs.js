const fs = require('fs');
const path = require('path');

// 获取当前工作目录
const cwd = process.cwd();
console.log('Current working directory:', cwd);

// 尝试列出目录内容
try {
  const files = fs.readdirSync(cwd);
  console.log('Files in directory:', files);
} catch (err) {
  console.error('Error listing directory:', err);
}

// 尝试读取JSON文件
const jsonFilePath = path.join(cwd, 'criminal_cases_facts.json');
try {
  console.log('Checking if file exists:', jsonFilePath);
  const exists = fs.existsSync(jsonFilePath);
  console.log('File exists:', exists);
  
  if (exists) {
    const stats = fs.statSync(jsonFilePath);
    console.log('File stats:', {
      size: stats.size,
      isFile: stats.isFile(),
      created: stats.birthtime,
      modified: stats.mtime
    });
    
    const content = fs.readFileSync(jsonFilePath, 'utf-8');
    console.log('File content length:', content.length);
    console.log('First 100 characters:', content.substring(0, 100));
  }
} catch (err) {
  console.error('Error reading file:', err);
} 