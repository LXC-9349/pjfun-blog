/**
 * 获取环境变量值
 * 优先级顺序：
 * 1. 系统环境变量（最高优先级）
 * 2. .env 文件（中等优先级）
 * @param key - 环境变量键名
 * @param defaultValue - 默认值
 * @returns 环境变量值
 */
export function getEnvVariable(key: string, defaultValue?: string): string | undefined {
    // 1. 首先检查系统环境变量（最高优先级）
    //@ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        //@ts-ignore
        return process.env[key];
    }

    // 2. 检查 window 对象（浏览器环境）
    if (typeof window !== 'undefined' && window[key as keyof Window]) {
        return window[key as keyof Window] as string;
    }

    // 2. 检查 import.meta.env（Vite 环境变量）
    try {
        switch (key) {
            case 'VITE_TITLE':
                return import.meta.env.VITE_TITLE || defaultValue;
            case 'VITE_BLOG_PASSWORD_HASH':
                return import.meta.env.VITE_BLOG_PASSWORD_HASH || defaultValue;
        }
        return defaultValue
    } catch (e) {
        // 在非ES模块环境中忽略错误
    }

    // 3. 返回默认值
    return defaultValue;
}

/**
 * 显示确认对话框选项
 */
interface ConfirmDialogOptions {
  confirmText?: string;
  cancelText?: string;
  type?: string;
}

/**
 * 显示确认对话框
 * @param title - 对话框标题
 * @param message - 对话框内容
 * @param options - 对话框选项
 * @returns 用户点击确认返回true，取消返回false
 */
export function confirmDialog(title: string, message: string, options: ConfirmDialogOptions = {}): Promise<boolean> {
    const defaultOptions = {
        confirmText: '确定',
        cancelText: '取消',
        type: 'confirm' // confirm, alert, prompt
    };
    
    const opts = Object.assign(defaultOptions, options);
    
    return new Promise((resolve) => {
        // 创建对话框容器
        const dialogWrapper = document.createElement('div');
        dialogWrapper.className = 'dialog-wrapper';
        dialogWrapper.innerHTML = `
          <div class="dialog-overlay"></div>
          <div class="dialog-container">
            <div class="dialog-content">
              <div class="dialog-header">
                <h3>${title}</h3>
              </div>
              <div class="dialog-body">
                <p>${message}</p>
              </div>
              <div class="dialog-footer">
                <button class="dialog-btn dialog-btn-cancel">${opts.cancelText}</button>
                <button class="dialog-btn dialog-btn-confirm">${opts.confirmText}</button>
              </div>
            </div>
          </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
          .dialog-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          }
          
          .dialog-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(2px);
            animation: dialogOverlayFadeIn 0.2s ease-out;
          }
          
          .dialog-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            min-width: 320px;
            max-width: 480px;
            width: 90%;
            animation: dialogFadeIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          
          @media (prefers-color-scheme: dark) {
            .dialog-container {
              background: #1f2937;
            }
          }
          
          @keyframes dialogOverlayFadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes dialogFadeIn {
            from {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }
          
          .dialog-header {
            padding: 24px 24px 8px;
          }
          
          .dialog-header h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            text-align: center;
          }
          
          @media (prefers-color-scheme: dark) {
            .dialog-header h3 {
              color: #f9fafb;
            }
          }
          
          .dialog-body {
            padding: 8px 24px 24px;
          }
          
          .dialog-body p {
            margin: 0;
            color: #4b5563;
            line-height: 1.6;
            font-size: 16px;
            text-align: center;
          }
          
          @media (prefers-color-scheme: dark) {
            .dialog-body p {
              color: #d1d5db;
            }
          }
          
          .dialog-footer {
            padding: 16px 24px 24px;
            display: flex;
            justify-content: center;
            gap: 12px;
          }
          
          .dialog-btn {
            padding: 10px 20px;
            border-radius: 8px;
            border: none;
            font-size: 15px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            min-width: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .dialog-btn-cancel {
            background: linear-gradient(to right, #f3f4f6, #e5e7eb);
            color: #4b5563;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          }
          
          @media (prefers-color-scheme: dark) {
            .dialog-btn-cancel {
              background: linear-gradient(to right, #374151, #4b5563);
              color: #d1d5db;
            }
          }
          
          .dialog-btn-cancel:hover {
            background: linear-gradient(to right, #e5e7eb, #d1d5db);
          }
          
          @media (prefers-color-scheme: dark) {
            .dialog-btn-cancel:hover {
              background: linear-gradient(to right, #4b5563, #6b7280);
            }
          }
          
          .dialog-btn-confirm {
            background: linear-gradient(to right, #3b82f6, #2563eb);
            color: white;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          }
          
          .dialog-btn-confirm:hover {
            background: linear-gradient(to right, #2563eb, #1d4ed8);
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          
          .dialog-btn:active {
            transform: translateY(0);
          }
        `;
        
        // 添加到页面
        document.body.appendChild(dialogWrapper);
        document.head.appendChild(style);
        
        // 绑定事件
        const confirmBtn = dialogWrapper.querySelector('.dialog-btn-confirm') as HTMLButtonElement;
        const cancelBtn = dialogWrapper.querySelector('.dialog-btn-cancel') as HTMLButtonElement;
        const overlay = dialogWrapper.querySelector('.dialog-overlay') as HTMLDivElement;
        
        const closeDialog = (result: boolean) => {
            // 添加关闭动画
            dialogWrapper.style.opacity = '0';
            dialogWrapper.style.transition = 'opacity 0.2s ease';
            
            setTimeout(() => {
                dialogWrapper.remove();
                style.remove();
                resolve(result);
            }, 200);
        };
        
        confirmBtn.addEventListener('click', () => closeDialog(true));
        cancelBtn.addEventListener('click', () => closeDialog(false));
        overlay.addEventListener('click', () => closeDialog(false));
        
        // ESC键关闭对话框
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeDialog(false);
                document.removeEventListener('keydown', handleEsc);
            }
        };
        
        document.addEventListener('keydown', handleEsc);
        
        // 自动聚焦到确认按钮
        confirmBtn.focus();
      });
}

/**
 * 显示提示对话框选项
 */
interface AlertDialogOptions {
  confirmText?: string;
}

/**
 * 显示提示对话框
 * @param title - 提示标题
 * @param message - 提示内容
 * @param options - 提示选项
 * @returns Promise
 */
export function alertDialog(title: string, message: string, options: AlertDialogOptions = {}): Promise<void> {
    const defaultOptions = {
        confirmText: '确定'
    };
    
    const opts = Object.assign(defaultOptions, options);
    
    return new Promise((resolve) => {
        // 创建提示框容器
        const dialogWrapper = document.createElement('div');
        dialogWrapper.className = 'alert-wrapper';
        dialogWrapper.innerHTML = `
          <div class="dialog-overlay"></div>
          <div class="dialog-container">
            <div class="dialog-content">
              <div class="dialog-header">
                <h3>${title}</h3>
              </div>
              <div class="dialog-body">
                <p>${message}</p>
              </div>
              <div class="dialog-footer">
                <button class="dialog-btn dialog-btn-confirm">${opts.confirmText}</button>
              </div>
            </div>
          </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
          .alert-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          }
          
          .dialog-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(2px);
            animation: dialogOverlayFadeIn 0.2s ease-out;
          }
          
          .dialog-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            min-width: 320px;
            max-width: 480px;
            width: 90%;
            animation: dialogFadeIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          
          @media (prefers-color-scheme: dark) {
            .dialog-container {
              background: #1f2937;
            }
          }
          
          @keyframes dialogOverlayFadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes dialogFadeIn {
            from {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }
          
          .dialog-header {
            padding: 24px 24px 8px;
          }
          
          .dialog-header h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            text-align: center;
          }
          
          @media (prefers-color-scheme: dark) {
            .dialog-header h3 {
              color: #f9fafb;
            }
          }
          
          .dialog-body {
            padding: 8px 24px 24px;
          }
          
          .dialog-body p {
            margin: 0;
            color: #4b5563;
            line-height: 1.6;
            font-size: 16px;
            text-align: center;
          }
          
          @media (prefers-color-scheme: dark) {
            .dialog-body p {
              color: #d1d5db;
            }
          }
          
          .dialog-footer {
            padding: 16px 24px 24px;
            display: flex;
            justify-content: center;
          }
          
          .dialog-btn {
            padding: 10px 20px;
            border-radius: 8px;
            border: none;
            font-size: 15px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            min-width: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .dialog-btn-confirm {
            background: linear-gradient(to right, #3b82f6, #2563eb);
            color: white;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          }
          
          .dialog-btn-confirm:hover {
            background: linear-gradient(to right, #2563eb, #1d4ed8);
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          
          .dialog-btn:active {
            transform: translateY(0);
          }
        `;
        
        // 添加到页面
        document.body.appendChild(dialogWrapper);
        document.head.appendChild(style);
        
        // 绑定事件
        const confirmBtn = dialogWrapper.querySelector('.dialog-btn-confirm') as HTMLButtonElement;
        const overlay = dialogWrapper.querySelector('.dialog-overlay') as HTMLDivElement;
        
        const closeDialog = () => {
            // 添加关闭动画
            dialogWrapper.style.opacity = '0';
            dialogWrapper.style.transition = 'opacity 0.2s ease';
            
            setTimeout(() => {
                dialogWrapper.remove();
                style.remove();
                resolve();
            }, 200);
        };
        
        confirmBtn.addEventListener('click', closeDialog);
        overlay.addEventListener('click', closeDialog);
        
        // ESC键关闭对话框
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeDialog();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        
        document.addEventListener('keydown', handleEsc);
        
        // 自动聚焦到确认按钮
        confirmBtn.focus();
    });
}

// 导入vue3-toastify并添加相关工具方法
import { toast} from 'vue3-toastify';
import type { ToastContent, Id,ToastOptions } from 'vue3-toastify';

/**
 * Toast选项接口
 */
interface ToastOptionsExtended extends ToastOptions {
  [key: string]: any;
}

/**
 * 显示成功消息
 * @param message - 消息内容
 * @param options - 配置选项
 * @returns Toast实例ID
 */
export function showSuccess(message: ToastContent, options: ToastOptionsExtended = {}): Id {
    const defaultOptions: ToastOptions = {
        theme: 'auto',
        position: 'bottom-right',
        autoClose: 3000
    };
    
    return toast.success(message, { ...defaultOptions, ...options });
}

/**
 * 显示错误消息
 * @param message - 消息内容
 * @param options - 配置选项
 * @returns Toast实例ID
 */
export function showError(message: ToastContent, options: ToastOptionsExtended = {}): Id {
    const defaultOptions: ToastOptions = {
        theme: 'auto',
        position: 'bottom-right',
        autoClose: 5000
    };
    
    return toast.error(message, { ...defaultOptions, ...options });
}

/**
 * 显示警告消息
 * @param message - 消息内容
 * @param options - 配置选项
 * @returns Toast实例ID
 */
export function showWarning(message: ToastContent, options: ToastOptionsExtended = {}): Id {
    const defaultOptions: ToastOptions = {
        theme: 'auto',
        position: 'bottom-right',
        autoClose: 4000
    };
    
    return toast.warn(message, { ...defaultOptions, ...options });
}

/**
 * 显示信息消息
 * @param message - 消息内容
 * @param options - 配置选项
 * @returns Toast实例ID
 */
export function showInfo(message: ToastContent, options: ToastOptionsExtended = {}): Id {
    const defaultOptions: ToastOptions = {
        theme: 'auto',
        position: 'bottom-right',
        autoClose: 3000
    };
    
    return toast.info(message, { ...defaultOptions, ...options });
}

/**
 * 显示加载中消息
 * @param message - 消息内容
 * @param options - 配置选项
 * @returns Toast实例ID
 */
export function showLoading(message: ToastContent = 'Loading...', options: ToastOptionsExtended = {}): Id {
    const defaultOptions: ToastOptions = {
        theme: 'auto',
        position: 'top-right',
        autoClose: false,
        closeButton: false
    };
    
    return toast.loading(message, { ...defaultOptions, ...options });
}

/**
 * 更新Toast消息
 * @param toastId - Toast实例ID
 * @param options - 更新选项
 */
export function updateToast(toastId: Id, options: ToastOptions): void {
    toast.update(toastId, options);
}

/**
 * 关闭指定Toast消息
 * @param toastId - Toast实例ID
 */
export function dismissToast(toastId: Id): void {
    (toast as any).dismiss(toastId);
}

/**
 * 关闭所有Toast消息
 */
export function dismissAllToasts(): void {
    (toast as any).dismiss();
}