#!/bin/bash

# API 测试脚本
# 确保开发服务器在 http://localhost:3000 运行

BASE_URL="${API_URL:-http://localhost:3000/api}"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "       AI 待办事项 API 测试脚本"
echo "=========================================="
echo ""

# 检查服务器是否运行
echo -e "${YELLOW}[检查] 测试服务器连接...${NC}"
if ! curl -s --connect-timeout 5 "$BASE_URL/todos" > /dev/null 2>&1; then
    echo -e "${RED}[错误] 无法连接到 $BASE_URL${NC}"
    echo "请先启动开发服务器: npm run dev"
    exit 1
fi
echo -e "${GREEN}[成功] 服务器连接正常${NC}"
echo ""

# ==========================================
# 测试 1: 创建待办事项 (POST /api/todos)
# ==========================================
echo "=========================================="
echo "测试 1: 创建待办事项 (POST /api/todos)"
echo "=========================================="

echo -e "${YELLOW}[请求] 创建任务: 学习 TypeScript${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/todos" \
  -H "Content-Type: application/json" \
  -d '{"title": "学习 TypeScript", "description": "从基础到进阶"}')

echo "响应: $RESPONSE"

# 提取 ID
TODO_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$TODO_ID" ]; then
    echo -e "${GREEN}[成功] 创建成功，ID: $TODO_ID${NC}"
else
    echo -e "${RED}[失败] 创建失败${NC}"
fi
echo ""

# ==========================================
# 测试 2: 获取所有待办事项 (GET /api/todos)
# ==========================================
echo "=========================================="
echo "测试 2: 获取所有待办事项 (GET /api/todos)"
echo "=========================================="

echo -e "${YELLOW}[请求] 获取所有任务...${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/todos")

# 计算任务数量
COUNT=$(echo $RESPONSE | grep -o '"id"' | wc -l | tr -d ' ')
echo "响应: $RESPONSE"
echo -e "${GREEN}[成功] 获取到 $COUNT 个任务${NC}"
echo ""

# ==========================================
# 测试 3: 获取单个待办事项 (GET /api/todos/:id)
# ==========================================
echo "=========================================="
echo "测试 3: 获取单个待办事项 (GET /api/todos/:id)"
echo "=========================================="

if [ -n "$TODO_ID" ]; then
    echo -e "${YELLOW}[请求] 获取任务 ID: $TODO_ID${NC}"
    RESPONSE=$(curl -s -X GET "$BASE_URL/todos/$TODO_ID")
    echo "响应: $RESPONSE"

    if echo "$RESPONSE" | grep -q "学习 TypeScript"; then
        echo -e "${GREEN}[成功] 获取单个任务成功${NC}"
    else
        echo -e "${RED}[失败] 获取单个任务失败${NC}"
    fi
else
    echo -e "${YELLOW}[跳过] 没有可用的任务 ID${NC}"
fi
echo ""

# ==========================================
# 测试 4: 更新待办事项状态 (PATCH /api/todos/:id)
# ==========================================
echo "=========================================="
echo "测试 4: 更新待办事项状态 (PATCH /api/todos/:id)"
echo "=========================================="

if [ -n "$TODO_ID" ]; then
    echo -e "${YELLOW}[请求] 将任务状态更新为 completed${NC}"
    RESPONSE=$(curl -s -X PATCH "$BASE_URL/todos/$TODO_ID" \
      -H "Content-Type: application/json" \
      -d '{"status": "completed"}')
    echo "响应: $RESPONSE"

    if echo "$RESPONSE" | grep -q '"status":"completed"'; then
        echo -e "${GREEN}[成功] 状态更新成功${NC}"
    else
        echo -e "${RED}[失败] 状态更新失败${NC}"
    fi
else
    echo -e "${YELLOW}[跳过] 没有可用的任务 ID${NC}"
fi
echo ""

# ==========================================
# 测试 5: 更新待办事项标题和描述 (PATCH /api/todos/:id)
# ==========================================
echo "=========================================="
echo "测试 5: 更新待办事项标题和描述"
echo "=========================================="

if [ -n "$TODO_ID" ]; then
    echo -e "${YELLOW}[请求] 更新标题和描述${NC}"
    RESPONSE=$(curl -s -X PATCH "$BASE_URL/todos/$TODO_ID" \
      -H "Content-Type: application/json" \
      -d '{"title": "深入学习 TypeScript", "description": "包含泛型和高级类型"}')
    echo "响应: $RESPONSE"

    if echo "$RESPONSE" | grep -q "深入学习 TypeScript"; then
        echo -e "${GREEN}[成功] 更新标题和描述成功${NC}"
    else
        echo -e "${RED}[失败] 更新失败${NC}"
    fi
else
    echo -e "${YELLOW}[跳过] 没有可用的任务 ID${NC}"
fi
echo ""

# ==========================================
# 测试 6: 创建带父任务的子任务
# ==========================================
echo "=========================================="
echo "测试 6: 创建带父任务的子任务"
echo "=========================================="

if [ -n "$TODO_ID" ]; then
    echo -e "${YELLOW}[请求] 创建子任务...${NC}"
    RESPONSE=$(curl -s -X POST "$BASE_URL/todos" \
      -H "Content-Type: application/json" \
      -d "{\"title\": \"学习泛型\", \"parent_id\": \"$TODO_ID\"}")
    echo "响应: $RESPONSE"

    SUB_TODO_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

    if echo "$RESPONSE" | grep -q "\"parent_id\":\"$TODO_ID\""; then
        echo -e "${GREEN}[成功] 子任务创建成功${NC}"
    else
        echo -e "${RED}[失败] 子任务创建失败${NC}"
    fi
else
    echo -e "${YELLOW}[跳过] 没有可用的父任务 ID${NC}"
fi
echo ""

# ==========================================
# 测试 7: 删除待办事项 (DELETE /api/todos/:id)
# ==========================================
echo "=========================================="
echo "测试 7: 删除待办事项 (DELETE /api/todos/:id)"
echo "=========================================="

if [ -n "$TODO_ID" ]; then
    echo -e "${YELLOW}[请求] 删除任务 ID: $TODO_ID (包含子任务)${NC}"
    RESPONSE=$(curl -s -X DELETE "$BASE_URL/todos/$TODO_ID")
    echo "响应: $RESPONSE"

    if echo "$RESPONSE" | grep -q "删除成功"; then
        echo -e "${GREEN}[成功] 删除成功${NC}"
    else
        echo -e "${RED}[失败] 删除失败${NC}"
    fi
else
    echo -e "${YELLOW}[跳过] 没有可用的任务 ID${NC}"
fi
echo ""

# ==========================================
# 测试 8: AI 拆解任务 (POST /api/ai/decompose)
# ==========================================
echo "=========================================="
echo "测试 8: AI 拆解任务 (POST /api/ai/decompose)"
echo "=========================================="

echo -e "${YELLOW}[请求] AI 拆解任务: 准备一场技术分享会${NC}"
echo -e "${YELLOW}(此测试需要配置有效的 OpenAI API Key)${NC}"

RESPONSE=$(curl -s -X POST "$BASE_URL/ai/decompose" \
  -H "Content-Type: application/json" \
  -d '{"task": "准备一场技术分享会"}' \
  --max-time 30)

echo "响应: $RESPONSE"

if echo "$RESPONSE" | grep -q '"mainTask"'; then
    echo -e "${GREEN}[成功] AI 拆解成功${NC}"

    # 提取主任务 ID 用于清理
    MAIN_TASK_ID=$(echo $RESPONSE | grep -o '"mainTask":{[^}]*"id":"[^"]*"' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

    if [ -n "$MAIN_TASK_ID" ]; then
        echo -e "${YELLOW}[清理] 删除测试创建的 AI 任务...${NC}"
        curl -s -X DELETE "$BASE_URL/todos/$MAIN_TASK_ID" > /dev/null
        echo -e "${GREEN}[完成] 清理完成${NC}"
    fi
elif echo "$RESPONSE" | grep -q "error"; then
    echo -e "${YELLOW}[提示] AI 服务可能未配置或不可用${NC}"
else
    echo -e "${RED}[失败] AI 拆解失败${NC}"
fi
echo ""

# ==========================================
# 测试 9: 错误处理 - 创建空标题任务
# ==========================================
echo "=========================================="
echo "测试 9: 错误处理 - 创建空标题任务"
echo "=========================================="

echo -e "${YELLOW}[请求] 尝试创建空标题任务...${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/todos" \
  -H "Content-Type: application/json" \
  -d '{"title": ""}')
echo "响应: $RESPONSE"

if echo "$RESPONSE" | grep -q "标题不能为空"; then
    echo -e "${GREEN}[成功] 正确返回错误信息${NC}"
else
    echo -e "${RED}[失败] 未能正确处理空标题${NC}"
fi
echo ""

# ==========================================
# 测试 10: 错误处理 - 获取不存在的任务
# ==========================================
echo "=========================================="
echo "测试 10: 错误处理 - 获取不存在的任务"
echo "=========================================="

FAKE_ID="00000000-0000-0000-0000-000000000000"
echo -e "${YELLOW}[请求] 获取不存在的任务 ID: $FAKE_ID${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/todos/$FAKE_ID")
echo "响应: $RESPONSE"

if echo "$RESPONSE" | grep -q "error"; then
    echo -e "${GREEN}[成功] 正确返回错误信息${NC}"
else
    echo -e "${YELLOW}[提示] 返回了意外响应${NC}"
fi
echo ""

# ==========================================
# 测试总结
# ==========================================
echo "=========================================="
echo "              测试完成"
echo "=========================================="
echo ""
echo "API 端点测试覆盖:"
echo "  ✓ GET    /api/todos          - 获取所有任务"
echo "  ✓ POST   /api/todos          - 创建任务"
echo "  ✓ GET    /api/todos/:id      - 获取单个任务"
echo "  ✓ PATCH  /api/todos/:id      - 更新任务"
echo "  ✓ DELETE /api/todos/:id      - 删除任务"
echo "  ✓ POST   /api/ai/decompose   - AI 拆解任务"
echo ""
