import {getLanguage, t} from "@/utils/i18n";
// 导入vue3-toastify并添加相关工具方法
import { toast} from 'vue3-toastify';
import type { ToastContent, Id,ToastOptions } from 'vue3-toastify';
import {GIT_REPO} from "@/constants";

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
            case 'VITE_BASE':
                return import.meta.env.VITE_BASE || defaultValue;
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

// 通用对话框样式
let dialogStyleInjected = false;
function injectDialogStyles() {
    if (dialogStyleInjected) return;
    
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
      
      .prompt-input {
        width: 100%;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #d1d5db;
        background: #fff;
        font-size: 16px;
        margin-bottom: 16px;
        box-sizing: border-box;
      }
      
      @media (prefers-color-scheme: dark) {
        .prompt-input {
          background: #111827;
          border-color: #4b5563;
          color: #f9fafb;
        }
      }
      
      .select-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 16px;
      }
      
      .select-option-btn {
        width: 100%;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #d1d5db;
        background: #fff;
        font-size: 16px;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
      }
      
      .select-option-btn:hover {
        background: #f3f4f6;
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      
      @media (prefers-color-scheme: dark) {
        .select-option-btn {
          background: #111827;
          border-color: #4b5563;
          color: #f9fafb;
        }
        
        .select-option-btn:hover {
          background: #374151;
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
    
    document.head.appendChild(style);
    dialogStyleInjected = true;
}

/**
 * 通用对话框选项接口
 */
interface BaseDialogOptions {
  confirmText?: string;
  cancelText?: string;
}

/**
 * 通用对话框配置接口
 */
interface DialogConfig {
  title: string;
  message: string;
  options?: BaseDialogOptions;
  hasInput?: boolean;
  inputType?: string;
  placeholder?: string;
  hasSelect?: boolean;
  selectOptions?: Array<{ value: string, label: string }>;
  hasCancel?: boolean;
  hasConfirm?: boolean;
}

/**
 * 通用对话框函数
 * @param config - 对话框配置
 * @returns Promise，返回用户操作结果
 */
function createDialog<T>(config: DialogConfig): Promise<T> {
    return new Promise((resolve) => {
        // 注入样式
        injectDialogStyles();
        
        // 构建对话框内容
        let inputHtml = '';
        let selectHtml = '';
        let footerHtml = '';
        
        if (config.hasInput) {
            const inputType = config.inputType || 'text';
            const placeholder = config.placeholder || '';
            inputHtml = `<input type="${inputType}" class="prompt-input" placeholder="${placeholder}" />`;
        }
        
        if (config.hasSelect && config.selectOptions) {
            selectHtml = `
                <div class="select-options">
                  ${config.selectOptions.map(option => `
                    <button class="select-option-btn" data-value="${option.value}">${option.label}</button>
                  `).join('')}
                </div>
            `;
        }
        
        if (config.hasCancel !== false || config.hasConfirm) {
            footerHtml = '<div class="dialog-footer">';
            if (config.hasCancel !== false) {
                footerHtml += `<button class="dialog-btn dialog-btn-cancel">${config.options?.cancelText || '取消'}</button>`;
            }
            if (config.hasConfirm) {
                footerHtml += `<button class="dialog-btn dialog-btn-confirm">${config.options?.confirmText || '确定'}</button>`;
            }
            footerHtml += '</div>';
        }
        
        // 创建对话框容器
        const dialogWrapper = document.createElement('div');
        dialogWrapper.className = 'dialog-wrapper';
        dialogWrapper.innerHTML = `
          <div class="dialog-overlay"></div>
          <div class="dialog-container">
            <div class="dialog-content">
              <div class="dialog-header">
                <h3>${config.title}</h3>
              </div>
              <div class="dialog-body">
                <p>${config.message}</p>
                ${inputHtml}
                ${selectHtml}
              </div>
              ${footerHtml}
            </div>
          </div>
        `;
        
        // 添加到页面
        document.body.appendChild(dialogWrapper);
        
        // 获取元素并绑定事件
        const confirmBtn = dialogWrapper.querySelector('.dialog-btn-confirm') as HTMLButtonElement;
        const cancelBtn = dialogWrapper.querySelector('.dialog-btn-cancel') as HTMLButtonElement;
        const overlay = dialogWrapper.querySelector('.dialog-overlay') as HTMLDivElement;
        const promptInput = dialogWrapper.querySelector('.prompt-input') as HTMLInputElement;
        const optionButtons = dialogWrapper.querySelectorAll('.select-option-btn') as NodeListOf<HTMLButtonElement>;
        
        const closeDialog = (result: any) => {
            // 添加关闭动画
            dialogWrapper.style.opacity = '0';
            dialogWrapper.style.transition = 'opacity 0.2s ease';
            
            setTimeout(() => {
                dialogWrapper.remove();
                resolve(result);
            }, 200);
        };
        
        // 为确认按钮绑定事件
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (promptInput) {
                    // 输入框对话框：返回输入值或null
                    const value = promptInput.value.trim();
                    closeDialog(value || null);
                } else if (optionButtons.length > 0) {
                    // 选择对话框：不会在这里触发，选择按钮有单独处理
                } else {
                    // 确认对话框：返回true
                    closeDialog(true);
                }
            });
        }
        
        // 为取消按钮绑定事件
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => closeDialog(config.hasInput || config.hasSelect ? null : false));
        }
        
        // 为选择按钮绑定事件
        if (optionButtons.length > 0) {
            optionButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const value = button.getAttribute('data-value');
                    closeDialog(value || null);
                });
            });
        }
        
        // 点击遮罩层关闭
        if (config.hasCancel !== false) {
            overlay.addEventListener('click', () => closeDialog(config.hasInput || config.hasSelect ? null : false));
        }
        
        // ESC键关闭对话框
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeDialog(config.hasInput || config.hasSelect ? null : false);
                document.removeEventListener('keydown', handleEsc);
            }
        };
        
        document.addEventListener('keydown', handleEsc);
        
        // 自动聚焦
        if (promptInput) {
            promptInput.focus();
        } else if (confirmBtn) {
            confirmBtn.focus();
        }
    });
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
    
    return createDialog<boolean>({
        title,
        message,
        options: opts,
        hasCancel: true,
        hasConfirm: true
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
    
    return createDialog<void>({
        title,
        message,
        options: { confirmText: opts.confirmText },
        hasCancel: false,
        hasConfirm: true
    });
}

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

export const formatDate = (dateString: string) => {
    if (!dateString) return t('unknownDate')
    try {
        const date = new Date(dateString)
        const currentLang=getLanguage()
        if (isNaN(date.getTime())) return dateString
        return currentLang === 'zh'
            ? date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
            : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
        return dateString
    }
}

/**
 * 显示输入对话框选项
 */
interface PromptDialogOptions {
  confirmText?: string;
  cancelText?: string;
  inputType?: string;
  placeholder?: string;
}

/**
 * 显示输入对话框
 * @param title - 对话框标题
 * @param message - 对话框内容
 * @param options - 对话框选项
 * @returns 用户输入的值，取消返回null
 */
export function promptDialog(title: string, message: string, options: PromptDialogOptions = {}): Promise<string | null> {
    const defaultOptions = {
        confirmText: '确定',
        cancelText: '取消',
        inputType: 'text',
        placeholder: ''
    };
    
    const opts = Object.assign(defaultOptions, options);
    
    return createDialog<string | null>({
        title,
        message,
        options: opts,
        hasInput: true,
        inputType: opts.inputType,
        placeholder: opts.placeholder,
        hasCancel: true,
        hasConfirm: true
    });
}

export const getRepoInfo = (gitRepo:string=GIT_REPO) => {
    const parts = gitRepo.replace(/\/$/, '').split('/')
    if (parts.length >= 2) {
        return {
            owner: parts[parts.length - 2],
            //@ts-ignore
            repo: parts[parts.length - 1].replace(/\.git$/, '')
        }
    }
    return null
}

/**
 * 显示编辑器选择对话框
 * @param title - 对话框标题
 * @param message - 对话框内容
 * @param options - 可选择的编辑器选项
 * @returns 用户选择的编辑器类型，取消返回null
 */
export function selectDialog(title: string, message: string, options: Array<{ value: string, label: string }> = []): Promise<string | null> {
    return createDialog<string | null>({
        title,
        message,
        hasSelect: true,
        selectOptions: options,
        hasCancel: true
    });
}

export const repoInfo = getRepoInfo();
export const toDev = async () => {
    if (!repoInfo) {
        showError(t('noRepoInfo'))
        return
    }

    // 显示编辑器选择对话框
    const editorOptions = [
        { value: 'stackblitz', label: 'StackBlitz' },
        { value: 'githubdev', label: 'GitHub.dev (VSCode Online)' },
        { value: 'vscode', label: 'VSCode.dev' },
        { value: 'bolt', label: 'Bolt.new' }
    ]

    const selectedEditor = await selectDialog(
        t('chooseEditor'),
        t('selectEditorToOpenRepo'),
        editorOptions
    )

    if (selectedEditor) {
        let url
        switch (selectedEditor) {
            case 'stackblitz':
                url = `https://stackblitz.com/github/${repoInfo.owner}/${repoInfo.repo}`
                break
            case 'githubdev':
                url = `https://github.dev/${repoInfo.owner}/${repoInfo.repo}`
                break
            case 'vscode':
                url = `https://vscode.dev/github/${repoInfo.owner}/${repoInfo.repo}`
                break
            case 'bolt':
                url = `https://bolt.new/github/${repoInfo.owner}/${repoInfo.repo}`
                break
            default:
                url = `https://stackblitz.com/github/${repoInfo.owner}/${repoInfo.repo}`
        }
        window.open(url)
    }
}