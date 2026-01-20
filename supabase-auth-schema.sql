-- supabase-auth-schema.sql
-- 为 todos 表添加用户关联

-- 1. 添加 user_id 列
ALTER TABLE todos ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 2. 启用 Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 3. 创建 RLS 策略
CREATE POLICY "用户只能查看自己的任务" ON todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的任务" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的任务" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的任务" ON todos
  FOR DELETE USING (auth.uid() = user_id);

-- 4. 为 user_id 创建索引
CREATE INDEX idx_todos_user_id ON todos(user_id);
