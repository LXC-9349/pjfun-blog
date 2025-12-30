# 前端构建阶段
FROM docker.m.daocloud.io/node:20-alpine AS frontend-builder

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制包文件并安装依赖
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 复制源码并构建
COPY . .
RUN pnpm build

# Nginx 最终阶段（直接使用 alpine:edge 获取最新 Nginx + 模块）
FROM docker.m.daocloud.io/alpine:edge

# 换阿里源加速，并确保 edge/main 仓库可用（edge 默认包含 main 和 community）
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
    apk update && \
    apk add --no-cache \
        nginx \
        nginx-mod-http-brotli \
        nginx-mod-http-zstd \
        brotli-libs \
        zstd-libs && \
    rm -rf /var/cache/apk/*

# 创建必要目录并设置权限（模仿官方 nginx:alpine 镜像）
RUN mkdir -p /var/log/nginx /var/tmp/nginx /run/nginx && \
    chown -R nginx:nginx /var/log/nginx /var/tmp/nginx /etc/nginx /usr/lib/nginx/modules /run/nginx && \
    ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

# 复制自定义 nginx 配置（必须包含 load_module）
COPY nginx.conf /etc/nginx/nginx.conf

# 复制前端构建产物
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]