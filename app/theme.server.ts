// 这里我们使用自己的简单会话存储实现
import { Theme, isTheme } from "~/components/ThemeProvider";

const sessionSecret = SESSION_SECRET;

// 简单的cookie会话存储实现
class SimpleSessionStorage {
  private cookieName: string;
  private secrets: string[];
  
  constructor(cookieName: string, secrets: string[]) {
    this.cookieName = cookieName;
    this.secrets = secrets;
  }
  
  async getSession(cookieHeader: string | null) {
    // 非常简化的会话实现
    const data: Record<string, any> = {};
    
    return {
      get: (key: string) => data[key],
      set: (key: string, value: any) => { data[key] = value; },
      data
    };
  }
  
  async commitSession() {
    // 简化的提交实现
    return "";
  }
}

// 创建会话存储
const themeStorage = new SimpleSessionStorage("theme-cookie", [sessionSecret]);

async function getThemeSession(request: Request) {
  const session = await themeStorage.getSession(request.headers.get("Cookie"));
  return {
    getTheme: () => {
      const themeValue = session.get("theme");
      return isTheme(themeValue) ? themeValue : "dark";
    },
    setTheme: (theme: Theme) => session.set("theme", theme),
    commit: () => themeStorage.commitSession(),
  };
}

export { getThemeSession };
