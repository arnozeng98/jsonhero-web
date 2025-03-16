import { customRandom } from "nanoid";

console.log("jsonDoc.server.ts module loaded");

// Fixed document ID for consistent loading
const FIXED_DOC_ID = "criminal-cases";
console.log("FIXED_DOC_ID set to:", FIXED_DOC_ID);

type BaseJsonDocument = {
  id: string;
  title: string;
  readOnly: boolean;
};

export type RawJsonDocument = BaseJsonDocument & {
  type: "raw";
  contents: string;
};

export type JSONDocument = RawJsonDocument;

// 从本地服务器获取JSON数据
export async function fetchJsonData(): Promise<string> {
  try {
    // 使用文档根目录的URL
    const url = `http://localhost:8787/criminal_cases_facts.json`;
    console.log("Server-side fetching from:", url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch JSON: ${response.status} ${response.statusText}`);
    }
    
    const text = await response.text();
    console.log(`Successfully loaded JSON on server-side (${text.length} bytes)`);
    
    // 尝试解析JSON以验证它并计算项目数量
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        console.log(`JSON contains ${parsed.length} items`);
      } else {
        console.log("JSON is not an array, it's a:", typeof parsed);
      }
    } catch (parseError) {
      console.error("Warning: Could not parse JSON to count items:", parseError);
    }
    
    return text;
  } catch (error) {
    console.error("Error fetching JSON:", error);
    throw error;
  }
}

// Validate JSON content
function isValidJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    console.log("JSON validation successful");
    return true;
  } catch (e) {
    console.error("JSON validation failed:", e);
    return false;
  }
}

// Get the JSON document
export async function getDocument(
  slug: string
): Promise<JSONDocument | undefined> {
  console.log(`getDocument called with slug: "${slug}"`);
  
  try {
    // 简化ID验证逻辑
    // 只要slug不为空就接受它，不再严格检查
    if (!slug) {
      console.log("Empty slug provided");
      return undefined;
    }
    
    console.log("Processing document for slug:", slug);
    
    // 尝试获取JSON数据
    let contents;
    try {
      contents = await fetchJsonData();
      console.log("Successfully fetched JSON data");
    } catch (fetchError) {
      console.error("Error fetching JSON from server:", fetchError);
      
      // 只在开发环境中使用空数组作为后备，这样能明确看出问题
      console.log("Using empty array as fallback for development");
      contents = "[]";
    }
    
    if (!isValidJSON(contents)) {
      throw new Error("Invalid JSON format");
    }

    // 创建文档对象
    const doc: JSONDocument = {
      id: slug, // 使用传入的slug作为ID
      type: "raw" as const,
      contents,
      title: "Criminal Cases Data Viewer",
      readOnly: true,
    };

    console.log("Document successfully created with ID:", doc.id);
    return doc;
  } catch (error) {
    console.error("Error loading document:", error);
    
    // 即使出错也返回一个基本文档
    // 确保前端组件总能获得有效对象
    console.log("Returning basic document despite error");
    return {
      id: slug || "fallback-id",
      type: "raw" as const,
      contents: "[]", // 空数组作为后备
      title: "Criminal Cases Data Viewer - Error Loading",
      readOnly: true,
    };
  }
}

// 移除所有其他不需要的方法
