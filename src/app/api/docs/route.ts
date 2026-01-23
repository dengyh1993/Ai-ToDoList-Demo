// src/app/api/docs/route.ts
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export interface DocItem {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: DocItem[]
}

function getDocsTree(dirPath: string, basePath: string = ''): DocItem[] {
  const items: DocItem[] = []
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      const relativePath = path.join(basePath, entry.name)
      
      if (entry.isDirectory()) {
        const children = getDocsTree(fullPath, relativePath)
        if (children.length > 0) {
          items.push({
            name: entry.name,
            path: relativePath,
            type: 'folder',
            children
          })
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        items.push({
          name: entry.name.replace('.md', ''),
          path: relativePath.replace('.md', ''),
          type: 'file'
        })
      }
    }
  } catch (error) {
    console.error('Error reading docs directory:', error)
  }
  
  // 排序：文件夹在前，文件在后，按名称排序
  return items.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1
    }
    return a.name.localeCompare(b.name, 'zh-CN')
  })
}

export async function GET() {
  const docsPath = path.join(process.cwd(), 'docs', 'ai-md')
  const tree = getDocsTree(docsPath)
  
  return NextResponse.json({ docs: tree })
}
