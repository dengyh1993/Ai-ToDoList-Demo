// src/app/api/docs/[...slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), 'docs', 'ai-md', ...slug) + '.md';

  try {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: '文档不存在' }, { status: 404 });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = slug[slug.length - 1];

    return NextResponse.json({
      title: fileName,
      content,
      path: slug.join('/'),
    });
  } catch (error) {
    console.error('Error reading doc file:', error);
    return NextResponse.json({ error: '读取文档失败' }, { status: 500 });
  }
}
