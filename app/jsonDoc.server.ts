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

// 获取JSON数据
async function fetchJsonData(): Promise<string> {
  try {
    console.log("Attempting to fetch JSON data");
    
    // 检查是否在服务器端环境
    const isServer = typeof window === 'undefined';
    
    if (isServer) {
      console.log("Server-side rendering detected, using built-in JSON data");
      // 返回包含第一个和第二个案例的简化版本
      return JSON.stringify([
        {
          "Title": "R. v. Primeau",
          "Collection": "Supreme Court Judgments",
          "Date": "1995-04-13",
          "Neutral Citation": null,
          "Case Number": "23613",
          "Judges": "Lamer, Antonio; La Forest, Gérard V.; L'Heureux-Dubé, Claire; Sopinka, John; Gonthier, Charles Doherty; Cory, Peter deCarteret; McLachlin, Beverley; Iacobucci, Frank; Major, John C.",
          "On Appeal From": "Saskatchewan",
          "Subjects": "Constitutional law\nCourts\nCriminal law",
          "Statutes and Regulations Cited": [
            "Criminal Code , R.S.C., 1985, c. C‑46 , s. 784(1) ."
          ],
          "Facts": "II.The appellant, Dorne James Primeau, was jointly charged along with Rory Michael Cornish with the first degree murder of Calvin Aubichon. On a separate information, Jerry Allan Lefort was charged with the same murder."
        },
        {
          "Title": "R. v. Feeney",
          "Collection": "Supreme Court Judgments",
          "Date": "1997-05-22",
          "Neutral Citation": null,
          "Case Number": "24756",
          "Facts": "Sample facts for this case"
        }
      ], null, 2);
    }
    
    // 在客户端环境中使用fetch
    // 优先尝试从/data目录获取
    try {
      const response = await fetch("/criminal_cases_facts.json");
      
      if (response.ok) {
        const content = await response.text();
        console.log(`Successfully fetched JSON from public path (${content.length} bytes)`);
        return content;
      }
    } catch (error) {
      console.warn("Failed to fetch from public path, trying absolute path");
    }
    
    // 尝试使用绝对URL
    const jsonUrl = window.location.origin + "/criminal_cases_facts.json";
    console.log("Fetching JSON from URL:", jsonUrl);
    
    const response = await fetch(jsonUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch JSON: ${response.status} ${response.statusText}`);
    }
    
    const content = await response.text();
    console.log(`Successfully fetched JSON data (${content.length} bytes)`);
    return content;
  } catch (error: any) {
    console.error("Error fetching JSON data:", error);
    
    // 在出错时返回基本JSON而不是抛出错误
    console.log("Returning fallback JSON data");
    return JSON.stringify([
      {
        "Title": "Failed to load data",
        "Collection": "Error",
        "Facts": "There was an error loading the JSON data: " + error.message
      }
    ], null, 2);
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
      console.log("Using fallback JSON data");
      // 使用内置的简单JSON作为备份
      contents = JSON.stringify([
        {
          "Title": "R. v. Primeau",
          "Collection": "Supreme Court Judgments",
          "Citation": "1995 CanLII 60 (SCC)",
          "Summary": "Example criminal case"
        },
        {
          "Title": "R. v. Collins",
          "Collection": "Supreme Court Judgments",
          "Citation": "1987 CanLII 84 (SCC)",
          "Summary": "Another example criminal case"
        }
      ], null, 2);
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
      contents: JSON.stringify([{"Error": "Failed to load data"}], null, 2),
      title: "Criminal Cases Data Viewer",
      readOnly: true,
    };
  }
}

// 移除所有其他不需要的方法
