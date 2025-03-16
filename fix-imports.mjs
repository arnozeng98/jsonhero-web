import { replace } from 'replace-in-file';

(async () => {
  try {
    // 替换 "remix" 导入为 "@remix-run/react"
    const results1 = await replace({
      files: 'app/**/*.{ts,tsx}',
      from: /import\s+{([^}]*)}\s+from\s+["']remix["'];/g,
      to: (match, p1) => {
        // 分析导入的内容，区分类型和值
        const imports = p1.split(',').map(i => i.trim());
        
        // 类型导入
        const typeImports = imports.filter(i => 
          ['MetaFunction', 'LoaderFunction', 'ActionFunction', 'ThrownResponse'].includes(i.trim()));
        
        // 普通导入
        const valueImports = imports.filter(i => 
          !['MetaFunction', 'LoaderFunction', 'ActionFunction', 'ThrownResponse'].includes(i.trim()));
        
        let result = '';
        
        if (valueImports.length > 0) {
          result += `import { ${valueImports.join(', ')} } from "@remix-run/react";\n`;
        }
        
        if (typeImports.length > 0) {
          result += `import type { ${typeImports.join(', ')} } from "@remix-run/cloudflare-workers";`;
        }
        
        return result;
      }
    });
    
    // 替换 "remix" 类型导入
    const results2 = await replace({
      files: 'app/**/*.{ts,tsx}',
      from: /import\s+type\s+{([^}]*)}\s+from\s+["']remix["'];/g,
      to: `import type { $1 } from "@remix-run/cloudflare-workers";`
    });
    
    console.log('修改的文件:', [...results1.filter(r => r.hasChanged).map(r => r.file), 
                            ...results2.filter(r => r.hasChanged).map(r => r.file)]);
  } catch (error) {
    console.error('Error occurred:', error);
  }
})(); 