// src/app/docs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { useTheme } from '@/app/components/ThemeContext';

interface DocItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: DocItem[];
}

interface DocContent {
  title: string;
  content: string;
  path: string;
}

// 主题切换按钮组件
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
    >
      {theme === 'light' ? (
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5 text-yellow-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  );
}

export default function DocsPage() {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [docLoading, setDocLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 收集所有文件夹路径
  const collectAllFolders = (items: DocItem[]): string[] => {
    const folders: string[] = [];
    items.forEach((item) => {
      if (item.type === 'folder') {
        folders.push(item.path);
        if (item.children) folders.push(...collectAllFolders(item.children));
      }
    });
    return folders;
  };

  // 展开全部
  const expandAll = () => {
    const allFolders = collectAllFolders(docs);
    setExpandedFolders(new Set(allFolders));
  };

  // 折叠全部
  const collapseAll = () => {
    setExpandedFolders(new Set());
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/docs');
      const data = await res.json();
      setDocs(data.docs);

      // 默认展开所有文件夹
      const folders = new Set<string>();
      const collectFolders = (items: DocItem[]) => {
        items.forEach((item) => {
          if (item.type === 'folder') {
            folders.add(item.path);
            if (item.children) collectFolders(item.children);
          }
        });
      };
      collectFolders(data.docs);
      setExpandedFolders(folders);
    } catch (error) {
      console.error('Failed to fetch docs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocContent = async (docPath: string) => {
    setDocLoading(true);
    try {
      const res = await fetch(`/api/docs/${docPath}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedDoc(data);
      }
    } catch (error) {
      console.error('Failed to fetch doc content:', error);
    } finally {
      setDocLoading(false);
    }
  };

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  const renderDocItem = (item: DocItem, level: number = 0) => {
    const paddingLeft = level * 16;

    if (item.type === 'folder') {
      const isExpanded = expandedFolders.has(item.path);
      return (
        <div key={item.path}>
          <button
            onClick={() => toggleFolder(item.path)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            style={{ paddingLeft: paddingLeft + 12 }}
          >
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <svg
              className="w-5 h-5 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
            </svg>
            <span className="text-gray-700 dark:text-gray-200 font-medium">
              {item.name}
            </span>
          </button>
          {isExpanded && item.children && (
            <div>
              {item.children.map((child) => renderDocItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    const isSelected = selectedDoc?.path === item.path;
    return (
      <button
        key={item.path}
        onClick={() => fetchDocContent(item.path)}
        className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition-colors ${
          isSelected
            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
        }`}
        style={{ paddingLeft: paddingLeft + 12 }}
      >
        <svg
          className="w-5 h-5 flex-shrink-0 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span className="text-sm leading-snug break-words whitespace-normal text-left">
          {item.name}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>返回</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <svg
                className="w-6 h-6 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              学习文档
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex">
        {/* 左侧文档列表 - 固定定位 */}
        <aside
          className={`${sidebarCollapsed ? 'w-12' : 'w-80'} flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-[calc(100vh-57px)] transition-all duration-300 sticky top-[57px] overflow-y-auto`}
        >
          {/* 折叠/展开侧边栏按钮 */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-4 z-20 w-6 h-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            title={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {!sidebarCollapsed && (
            <div className="p-4 overflow-y-auto h-full">
              {/* 标题和操作按钮 */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  文档目录
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={expandAll}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="展开全部"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={collapseAll}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="折叠全部"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : docs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  暂无文档
                </p>
              ) : (
                <nav className="space-y-1">
                  {docs.map((item) => renderDocItem(item))}
                </nav>
              )}
            </div>
          )}

          {sidebarCollapsed && (
            <div className="flex flex-col items-center pt-12 gap-2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          )}
        </aside>

        {/* 右侧文档内容 */}
        <main className="flex-1 min-h-[calc(100vh-57px)] overflow-y-auto">
          {docLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : selectedDoc ? (
            <article className="p-8 max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                {selectedDoc.title}
              </h1>
              <div
                className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:text-gray-800 dark:prose-headings:text-white
                prose-headings:font-bold prose-headings:leading-tight
                prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4
                prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-700 prose-h2:pb-2
                prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
                prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:my-4
                prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-800 dark:prose-strong:text-white
                prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:shadow-md prose-pre:overflow-x-auto
                prose-img:rounded-lg prose-img:shadow-lg prose-img:mx-auto prose-img:my-6
                prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800/50 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:italic
                prose-li:text-gray-600 dark:prose-li:text-gray-300 prose-li:my-1
                prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
                prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
                prose-table:border-collapse prose-table:w-full prose-table:my-4
                prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-600 prose-th:px-4 prose-th:py-2 prose-th:bg-gray-100 dark:prose-th:bg-gray-700
                prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-600 prose-td:px-4 prose-td:py-2
                prose-hr:my-8 prose-hr:border-gray-200 dark:prose-hr:border-gray-700
              "
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    img: ({ ...props }) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        {...props}
                        alt={props.alt || ''}
                        loading="lazy"
                        className="max-w-full h-auto"
                      />
                    ),
                  }}
                >
                  {selectedDoc.content}
                </ReactMarkdown>
              </div>
            </article>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <svg
                className="w-24 h-24 mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <p className="text-xl">请从左侧选择一篇文档开始阅读</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
