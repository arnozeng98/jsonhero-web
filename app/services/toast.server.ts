// 这里使用自定义的简单会话存储

// 声明我们自己的Session类型
interface Session {
  flash: (key: string, value: any) => void;
  get: (key: string) => any;
  set: (key: string, value: any) => void;
  unset: (key: string) => void;
  data: Record<string, any>;
}

export type ToastMessage = {
  message: string;
  title: string;
  type: "success" | "error";
  id: string;
};

const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;

// 简单的会话存储实现
class SimpleSessionStorage {
  private cookieData: Record<string, any> = {};
  
  // 简单的getSession实现
  async getSession() {
    const session = {
      data: this.cookieData,
      flash(key: string, value: any) {
        this.data[key] = value;
      },
      get(key: string) {
        return this.data[key];
      },
      set(key: string, value: any) {
        this.data[key] = value;
      },
      unset(key: string) {
        delete this.data[key];
      }
    };
    
    return session;
  }
  
  // 简单的commitSession实现
  async commitSession() {
    return "session-id";
  }
}

const storage = new SimpleSessionStorage();

export const getSession = () => storage.getSession();
export const commitSession = () => storage.commitSession();

export function setSuccessMessage(
  session: Session,
  message: string,
  title: string
) {
  session.flash("toastMessage", {
    message,
    title,
    type: "success",
    id: crypto.randomUUID(),
  });
}

export function setErrorMessage(
  session: Session,
  message: string,
  title: string
) {
  session.flash("toastMessage", {
    message,
    title,
    type: "error",
    id: crypto.randomUUID(),
  });
}
