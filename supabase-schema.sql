-- Supabase SQL Schema
-- 在 Supabase Dashboard -> SQL Editor 中运行此脚本

-- 创建 todos 表
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  parent_id UUID REFERENCES todos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_todos_parent_id ON todos(parent_id);
CREATE INDEX idx_todos_created_at ON todos(created_at DESC);
CREATE INDEX idx_todos_status ON todos(status);

-- 启用 Row Level Security (可选，用于多用户场景)
-- ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
