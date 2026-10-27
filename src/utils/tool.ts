import {getLanguage, t} from "@/utils/i18n";
// 导入vue3-toastify并添加相关工具方法
import { toast} from 'vue3-toastify';
import type { ToastContent, Id,ToastOptions } from 'vue3-toastify';
import {GIT_REPO, UI_CONFIG} from "@/constants";

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
    const nodeEnv = (globalThis as {
        process?: { env?: Record<string, string | undefined> }
    }).process?.env
    if (nodeEnv && nodeEnv[key]) {
        return nodeEnv[key]
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
            // Site configuration
            case 'VITE_SITE_ICON':
                return import.meta.env.VITE_SITE_ICON || defaultValue;
            case 'VITE_SITE_TITLE':
                return import.meta.env.VITE_SITE_TITLE || defaultValue;
            case 'VITE_SITE_DESCRIPTION':
                return import.meta.env.VITE_SITE_DESCRIPTION || defaultValue;
            case 'VITE_SITE_AUTHOR':
                return import.meta.env.VITE_SITE_AUTHOR || defaultValue;
            case 'VITE_SITE_KEYWORDS':
                return import.meta.env.VITE_SITE_KEYWORDS || defaultValue;
            case 'VITE_SITE_EMAIL':
                return import.meta.env.VITE_SITE_EMAIL || defaultValue;
            // Social links
            case 'VITE_SOCIAL_GITHUB':
                return import.meta.env.VITE_SOCIAL_GITHUB || defaultValue;
            case 'VITE_SOCIAL_TELEGRAM':
                return import.meta.env.VITE_SOCIAL_TELEGRAM || defaultValue;
            // Footer links
            case 'VITE_FOOT_GITHUB':
                return import.meta.env.VITE_FOOT_GITHUB || defaultValue;
            // Giscus configuration
            case 'VITE_GISCUS_ENABLED':
                return import.meta.env.VITE_GISCUS_ENABLED || defaultValue;
            case 'VITE_GISCUS_REPO':
                return import.meta.env.VITE_GISCUS_REPO || defaultValue;
            case 'VITE_GISCUS_REPO_ID':
                return import.meta.env.VITE_GISCUS_REPO_ID || defaultValue;
            case 'VITE_GISCUS_CATEGORY':
                return import.meta.env.VITE_GISCUS_CATEGORY || defaultValue;
            case 'VITE_GISCUS_CATEGORY_ID':
                return import.meta.env.VITE_GISCUS_CATEGORY_ID || defaultValue;
            case 'VITE_GISCUS_MAPPING':
                return import.meta.env.VITE_GISCUS_MAPPING || defaultValue;
            case 'VITE_GISCUS_STRICT':
                return import.meta.env.VITE_GISCUS_STRICT || defaultValue;
            case 'VITE_GISCUS_REACTIONS':
                return import.meta.env.VITE_GISCUS_REACTIONS || defaultValue;
            case 'VITE_GISCUS_METADATA':
                return import.meta.env.VITE_GISCUS_METADATA || defaultValue;
            case 'VITE_GISCUS_POSITION':
                return import.meta.env.VITE_GISCUS_POSITION || defaultValue;
            case 'VITE_GISCUS_LANG':
                return import.meta.env.VITE_GISCUS_LANG || defaultValue;
            // Hot tags
            case 'VITE_HOT_TAGS':
                return import.meta.env.VITE_HOT_TAGS || defaultValue;
        }
        return defaultValue
    } catch (e) {
        // 在非ES模块环境中忽略错误
    }

    // 3. 返回默认值
    return defaultValue;
}

/**
 * 转义插入 innerHTML 模板的文本
 * 仓库地址来自环境变量，避免其中的 & " ' 等字符破坏标签结构
 */
function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
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
        z-index: ${UI_CONFIG.dialogZIndex};
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
      
      html.dark .dialog-container {
        background: #1f2937;
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
      
      html.dark .dialog-header h3 {
        color: #f9fafb;
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
      
      html.dark .dialog-body p {
        color: #d1d5db;
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
      
      html.dark .prompt-input {
        background: #111827;
        border-color: #4b5563;
        color: #f9fafb;
      }
      
      .select-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 16px;
      }
      
      .select-option-btn {
        width: 100%;
        padding: 12px 16px;
        border-radius: 8px;
        border: 1px solid #d1d5db;
        background: #fff;
        font-size: 16px;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .select-option-label {
        font-weight: 500;
        color: #1f2937;
      }
      
      html.dark .select-option-label {
        color: #f9fafb;
      }
      
      .select-option-description {
        font-size: 13px;
        color: #6b7280;
        line-height: 1.4;
      }
      
      html.dark .select-option-description {
        color: #9ca3af;
      }
      
      .select-option-btn:hover {
        background: #f3f4f6;
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      
      html.dark .select-option-btn {
        background: #111827;
        border-color: #4b5563;
        color: #f9fafb;
      }
      
      html.dark .select-option-btn:hover {
        background: #374151;
      }
      
      /* 对话框内的源仓库链接卡片：沿用主题色，深浅色均自动适配 */
      .dialog-repo-link {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 16px;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid rgb(var(--accent-500) / 0.25);
        background: rgb(var(--accent-500) / 0.07);
        text-decoration: none;
        transition: all 0.2s ease;
      }
      
      .dialog-repo-link:hover {
        border-color: rgb(var(--accent-500) / 0.5);
        background: rgb(var(--accent-500) / 0.12);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px -4px rgb(var(--accent-900) / 0.25);
      }
      
      .dialog-repo-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: none;
        width: 30px;
        height: 30px;
        border-radius: 8px;
        background: rgb(var(--accent-500) / 0.16);
        color: rgb(var(--accent-600));
      }
      
      .dialog-repo-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
        text-align: left;
      }
      
      .dialog-repo-label {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.06em;
        color: #6b7280;
      }
      
      .dialog-repo-url {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
        font-size: 13px;
        line-height: 1.4;
        color: #1f2937;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .dialog-repo-arrow {
        display: flex;
        flex: none;
        color: #9ca3af;
        transition: transform 0.2s ease, color 0.2s ease;
      }
      
      .dialog-repo-link:hover .dialog-repo-arrow {
        color: rgb(var(--accent-600));
        transform: translate(2px, -2px);
      }
      
      html.dark .dialog-repo-link {
        border-color: rgb(var(--accent-500) / 0.4);
        background: rgb(var(--accent-500) / 0.12);
      }
      
      html.dark .dialog-repo-link:hover {
        border-color: rgb(var(--accent-500) / 0.65);
        background: rgb(var(--accent-500) / 0.18);
        box-shadow: 0 4px 12px -4px rgb(0 0 0 / 0.5);
      }
      
      html.dark .dialog-repo-icon {
        background: rgb(var(--accent-500) / 0.2);
        color: rgb(var(--accent-400));
      }
      
      html.dark .dialog-repo-label {
        color: #9ca3af;
      }
      
      html.dark .dialog-repo-url {
        color: #e5e7eb;
      }
      
      html.dark .dialog-repo-arrow {
        color: #9ca3af;
      }
      
      html.dark .dialog-repo-link:hover .dialog-repo-arrow {
        color: rgb(var(--accent-400));
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
      
      html.dark .dialog-btn-cancel {
        background: linear-gradient(to right, #374151, #4b5563);
        color: #d1d5db;
      }
      
      .dialog-btn-cancel:hover {
        background: linear-gradient(to right, #e5e7eb, #d1d5db);
      }
      
      html.dark .dialog-btn-cancel:hover {
        background: linear-gradient(to right, #4b5563, #6b7280);
      }
      
      .dialog-btn-confirm {
        background: linear-gradient(to right, rgb(var(--accent-500)), rgb(var(--accent-600)));
        color: white;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      }
      
      .dialog-btn-confirm:hover {
        background: linear-gradient(to right, rgb(var(--accent-600)), rgb(var(--accent-700)));
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
  selectOptions?: Array<{ value: string, label: string, description?: string }>;
  hasCancel?: boolean;
  hasConfirm?: boolean;
  /** 源仓库地址；传入后在选项上方渲染可点击跳转的仓库卡片 */
  repoUrl?: string;
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
        let repoHtml = '';
        
        if (config.hasInput) {
            const inputType = config.inputType || 'text';
            const placeholder = config.placeholder || '';
            inputHtml = `<input type="${inputType}" class="prompt-input" placeholder="${placeholder}" />`;
        }
        
        if (config.hasSelect && config.selectOptions) {
            selectHtml = `
                <div class="select-options">
                  ${config.selectOptions.map(option => `
                    <button class="select-option-btn" data-value="${option.value}">
                      <div class="select-option-label">${option.label}</div>
                      ${option.description ? `<div class="select-option-description">${option.description}</div>` : ''}
                    </button>
                  `).join('')}
                </div>
            `;
        }
        
        if (config.hasCancel !== false || config.hasConfirm) {
            footerHtml = '<div class="dialog-footer">';
            if (config.hasCancel !== false) {
                footerHtml += `<button class="dialog-btn dialog-btn-cancel">${config.options?.cancelText || t('cancel')}</button>`;
            }
            if (config.hasConfirm) {
                footerHtml += `<button class="dialog-btn dialog-btn-confirm">${config.options?.confirmText || t('confirm')}</button>`;
            }
            footerHtml += '</div>';
        }
        
        if (config.repoUrl) {
            const repoHref = escapeHtml(config.repoUrl);
            const repoLabel = escapeHtml(t('sourceRepo'));
            const openTip = escapeHtml(t('openRepoInNewWindow'));
            repoHtml = `
                <a class="dialog-repo-link" href="${repoHref}" target="_blank" rel="noopener noreferrer" title="${openTip}">
                  <span class="dialog-repo-icon" aria-hidden="true">
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/>
                    </svg>
                  </span>
                  <span class="dialog-repo-text">
                    <span class="dialog-repo-label">${repoLabel}</span>
                    <span class="dialog-repo-url" title="${repoHref}">${repoHref}</span>
                  </span>
                  <span class="dialog-repo-arrow" aria-hidden="true">
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9.5 2.5h4v4"/>
                      <path d="M13.5 2.5 7.5 8.5"/>
                      <path d="M12 9.5v3a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3"/>
                    </svg>
                  </span>
                </a>
            `;
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
                ${repoHtml}
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
        
        let closed = false
        const closeDialog = (result: any) => {
            if (closed) return
            closed = true
            document.removeEventListener('keydown', handleEsc)
            // 添加关闭动画
            dialogWrapper.style.opacity = '0';
            dialogWrapper.style.transition = 'opacity 0.2s ease';
            
            setTimeout(() => {
                dialogWrapper.remove();
                resolve(result);
            }, UI_CONFIG.dialogCloseAnimationMs);
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
        confirmText: t('confirm'),
        cancelText: t('cancel'),
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
        confirmText: t('confirm')
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
        autoClose: UI_CONFIG.toastAutoCloseMs
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
        autoClose: UI_CONFIG.toastErrorAutoCloseMs
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
        autoClose: UI_CONFIG.toastWarnAutoCloseMs
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
        autoClose: UI_CONFIG.toastAutoCloseMs
    };
    
    return toast.info(message, { ...defaultOptions, ...options });
}

/**
 * 显示加载中消息
 * @param message - 消息内容
 * @param options - 配置选项
 * @returns Toast实例ID
 */
export function showLoading(message: ToastContent = t('loading'), options: ToastOptionsExtended = {}): Id {
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

// 日期格式化器：缓存 Intl 实例，避免每次渲染都重新创建（列表页大量调用时开销明显）
const DATE_FORMATTERS = {
    zh: new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
    en: new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
} as const

export const formatDate = (dateString: string) => {
    if (!dateString) return t('unknownDate')
    try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return dateString
        const formatter = getLanguage() === 'zh' ? DATE_FORMATTERS.zh : DATE_FORMATTERS.en
        return formatter.format(date)
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
        confirmText: t('confirm'),
        cancelText: t('cancel'),
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
            owner: parts[parts.length - 2]!,
            repo: parts[parts.length - 1]!.replace(/\.git$/, '')
        }
    }
    return null
}

/**
 * 显示编辑器选择对话框
 * @param title - 对话框标题
 * @param message - 对话框内容
 * @param options - 可选择的编辑器选项
 * @param repoUrl - 源仓库地址（可选，展示为可点击跳转的卡片）
 * @returns 用户选择的编辑器类型，取消返回null
 */
export function selectDialog(
    title: string,
    message: string,
    options: Array<{ value: string, label: string, description?: string }> = [],
    repoUrl?: string
): Promise<string | null> {
    return createDialog<string | null>({
        title,
        message,
        hasSelect: true,
        selectOptions: options,
        repoUrl,
        hasCancel: true
    })
}

export const repoInfo = getRepoInfo();
export const toDev = async () => {
    if (!repoInfo) {
        showError(t('noRepoInfo'))
        return
    }

    // 显示编辑器选择对话框
    const editorOptions = [
        { value: 'stackblitz', label: 'StackBlitz', description: t('editorStackblitzDesc') },
        { value: 'githubdev', label: 'GitHub.dev', description: t('editorGithubDevDesc') },
        { value: 'vscode', label: 'VSCode.dev', description: t('editorVscodeDesc') },
        { value: 'bolt', label: 'Bolt.new', description: t('editorBoltDesc') }
    ]

    const selectedEditor = await selectDialog(
        t('chooseEditor'),
        t('selectEditorToOpenRepo'),
        editorOptions,
        GIT_REPO
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

// 拼接构建版本参数：CDN 若按 URL 缓存，构建版本变化即视为新资源
function withVersion(url: string, version: string): string {
    if (!version) return url
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}_v=${version}`
}

// 同一构建版本内复用已获取的响应，避免每次进入文章都重新下载完整导航数据。
// Response 的 body 只能读一次，因此缓存 clone 供后续调用使用。
const responseCache = new Map<string, Response>()
const RESPONSE_CACHE_LIMIT = 8

// Studio 保存文章后导航数据已更新，但 URL 在同一 dev 会话内不变，需要主动清空缓存
export const clearFetchCache = () => {
    responseCache.clear()
}

export const fetchWithFallback = async (urls: string[], dataType: string) => {
    let lastError: Error | null = null;
    // 请求 URL 已带构建版本号，天然规避旧缓存；不再用 no-store 强制回源，让 HTTP 缓存生效
    const version = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : ''

    for (const url of urls) {
        const requestUrl = withVersion(url, version)
        const cached = responseCache.get(requestUrl)
        if (cached) {
            return cached.clone()
        }

        try {
            console.log(`尝试请求 ${dataType}: ${requestUrl}`);
            const response = await fetch(requestUrl);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // 静态托管常把 404 回退成 index.html（HTTP 200 + HTML），
            // 这里提前识别，避免把 HTML 当 JSON 解析后整页报错，转而走下一个地址
            const contentType = response.headers.get('content-type') || ''
            if (dataType === 'json' && /text\/html/i.test(contentType)) {
                throw new Error(`返回了 HTML 而不是 JSON：${requestUrl}`);
            }

            if (responseCache.size >= RESPONSE_CACHE_LIMIT) {
                responseCache.clear()
            }
            responseCache.set(requestUrl, response.clone())
            return response;
        } catch (error) {
            console.warn(`请求失败 ${url}:`, error);
            lastError = error as Error;
            // 继续尝试下一个URL
        }
    }

    // 所有URL都失败
    throw new Error(`${dataType} 所有请求都失败了: ${lastError?.message}`);
};