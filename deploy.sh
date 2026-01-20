#!/bin/bash

# 部署脚本
echo "🚀 开始部署 AI 待办事项应用..."

# 检查 Node.js 版本
echo "📋 检查环境..."
node_version=$(node -v)
echo "Node.js 版本: $node_version"

if [[ $node_version < "v18" ]]; then
    echo "❌ 需要 Node.js 18 或更高版本"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 运行类型检查
echo "🔍 运行类型检查..."
npm run lint

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    echo "🎯 可以使用以下命令启动生产服务器："
    echo "   npm start"
    echo ""
    echo "🐳 或者使用 Docker："
    echo "   docker-compose up -d"
else
    echo "❌ 构建失败！"
    exit 1
fi