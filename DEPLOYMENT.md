# 📦 AI 待办事项应用 - 打包发布指南

## 🎯 概述

本项目是一个基于 Next.js 14 的全栈应用，支持多种部署方式。以下是详细的打包发布指南。

## 📋 构建前准备

### 环境要求
- **Node.js**: 18.17.0+ （建议 20.x）
- **npm**: 9.0+
- **系统**: Linux/macOS/Windows

### 检查当前环境
```bash
node -v    # 应显示 v18.17.0 或更高
npm -v     # 应显示 9.0.0 或更高
```

> ⚠️ **注意**: 项目构建时会出现 Node.js 18 版本警告，这是正常的，建议升级到 Node.js 20+ 以获得最佳性能。

## 🏗️ 构建流程

### 1. 基础构建
```bash
# 安装依赖
npm install

# 运行类型检查和代码规范检查
npm run lint

# 构建生产版本
npm run build

# 启动生产服务器（测试）
npm start
```

### 2. 自动化构建脚本
```bash
# 使用提供的自动化脚本
./deploy.sh
```

构建成功后会在 `.next` 目录生成优化后的静态文件和服务器代码。

## 🚀 部署方案

### 方案一：传统服务器部署

#### 1. 本地构建部署
```bash
# 1. 克隆代码
git clone <repository-url>
cd todo-ai

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入实际配置

# 3. 构建项目
npm install
npm run build

# 4. 启动服务
npm start
# 或者使用 PM2 进程管理
pm2 start npm --name "todo-ai" -- start
```

#### 2. 使用 PM2 进程管理
```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "todo-ai" -- start

# 查看状态
pm2 status

# 查看日志
pm2 logs todo-ai

# 重启应用
pm2 restart todo-ai

# 停止应用
pm2 stop todo-ai
```

### 方案二：Docker 部署

#### 1. 单个 Docker 容器
```bash
# 构建镜像
docker build -t todo-ai .

# 运行容器
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  -e XIAOMI_API_KEY=your_api_key \
  todo-ai
```

#### 2. 使用 Docker Compose（推荐）
```bash
# 1. 创建环境变量文件
echo "NEXT_PUBLIC_SUPABASE_URL=your_url" >> .env
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key" >> .env
echo "XIAOMI_API_KEY=your_api_key" >> .env

# 2. 启动服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 停止服务
docker-compose down
```

### 方案三：云平台部署

#### 1. Vercel 部署（推荐）
```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录并部署
vercel

# 3. 配置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add XIAOMI_API_KEY

# 4. 重新部署
vercel --prod
```

**Vercel 配置文件** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key", 
    "XIAOMI_API_KEY": "@xiaomi_api_key"
  }
}
```

#### 2. Netlify 部署
```bash
# 1. 安装 Netlify CLI
npm install -g netlify-cli

# 2. 构建静态版本（需要修改配置）
npm run build

# 3. 部署
netlify deploy --prod --dir=.next
```

#### 3. Railway 部署
```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 部署
railway deploy
```

### 方案四：VPS/云服务器部署

#### 1. 使用 Nginx 反向代理
```nginx
# /etc/nginx/sites-available/todo-ai
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/todo-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 2. 使用 SSL 证书（Let's Encrypt）
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 环境变量配置

### 必需的环境变量
```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI 服务配置
XIAOMI_API_KEY=your-openrouter-api-key
```

### 生产环境建议
```env
# 生产环境优化
NODE_ENV=production
ANALYZE=false                # 关闭包分析
NEXT_TELEMETRY_DISABLED=1    # 禁用遥测
```

## 📊 构建产物分析

构建完成后，会生成以下文件：
```
.next/
├── static/                  # 静态资源（CSS、JS、图片）
├── server.js               # Node.js 服务器入口
├── standalone/             # 独立运行时文件
└── ...                    # 其他构建产物
```

**构建大小参考**：
- 主页面：2.61 kB（gzip 后）
- 首次加载：89.8 kB
- 共享 JS：87.2 kB

## 🔄 CI/CD 集成

### GitHub Actions 配置
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run lint
      run: npm run lint
    
    - name: Build
      run: npm run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        XIAOMI_API_KEY: ${{ secrets.XIAOMI_API_KEY }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 🔍 部署验证

### 基础检查清单
- [ ] 应用正常启动（端口 3000）
- [ ] 静态资源加载正常
- [ ] API 接口响应正常
- [ ] Supabase 数据库连接正常
- [ ] AI 拆解功能正常工作
- [ ] 响应式布局在不同设备上正常显示

### 健康检查脚本
```bash
#!/bin/bash
# health-check.sh

echo "🔍 检查应用健康状态..."

# 检查服务是否运行
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 服务运行正常"
else
    echo "❌ 服务无法访问"
    exit 1
fi

# 检查 API 端点
if curl -f http://localhost:3000/api/todos > /dev/null 2>&1; then
    echo "✅ API 端点正常"
else
    echo "❌ API 端点异常"
    exit 1
fi

echo "🎉 所有检查通过！"
```

## 🚨 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 清理缓存
rm -rf .next node_modules
npm install
npm run build
```

#### 2. 环境变量问题
```bash
# 检查环境变量
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
echo $XIAOMI_API_KEY
```

#### 3. 端口占用
```bash
# 查找占用端口的进程
lsof -i :3000
# 杀死进程
kill -9 <PID>
```

#### 4. Docker 问题
```bash
# 重建 Docker 镜像
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📈 性能优化建议

### 生产环境优化
1. **启用 gzip 压缩**（Nginx）
2. **配置 CDN** 加速静态资源
3. **设置适当的缓存策略**
4. **监控和日志记录**
5. **定期更新依赖包**

### 监控指标
- 响应时间
- 错误率
- 内存使用
- CPU 使用率
- 数据库连接数

---

**最后更新**: 2026年1月  
**维护者**: 开发团队