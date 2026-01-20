// src/app/components/DateFilter.tsx
'use client'

import { useState } from 'react'
import { DateFilterType, DateRange, formatDate } from '@/lib/dateUtils'

interface DateFilterProps {
  value: { type: DateFilterType; customRange?: DateRange }
  onChange: (filter: { type: DateFilterType; customRange?: DateRange }) => void
}

export default function DateFilter({ value, onChange }: DateFilterProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customStart, setCustomStart] = useState(formatDate(new Date()))
  const [customEnd, setCustomEnd] = useState(formatDate(new Date()))

  const buttons: { type: DateFilterType; label: string }[] = [
    { type: 'all', label: '全部' },
    { type: 'today', label: '今天' },
    { type: 'week', label: '本周' },
    { type: 'month', label: '本月' },
  ]

  const handleButtonClick = (type: DateFilterType) => {
    setShowCustom(false)
    onChange({ type })
  }

  const handleCustomApply = () => {
    onChange({
      type: 'custom',
      customRange: { start: customStart, end: customEnd },
    })
    setShowCustom(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        {buttons.map((btn) => (
          <button
            key={btn.type}
            onClick={() => handleButtonClick(btn.type)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              value.type === btn.type
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {btn.label}
          </button>
        ))}

        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            value.type === 'custom'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          自定义
        </button>
      </div>

      {showCustom && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">开始:</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">结束:</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleCustomApply}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            应用筛选
          </button>
        </div>
      )}
    </div>
  )
}
