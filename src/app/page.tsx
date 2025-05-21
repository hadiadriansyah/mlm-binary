'use client'

import dynamic from 'next/dynamic'

const TreeD3 = dynamic(() => import('@/components/TreeD3'), {
  ssr: false,
  loading: () => <p>Loading tree...</p>,
})

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold text-center mb-6">MLM Binary Tree Viewer</h1>
      <TreeD3 />
    </main>
  )
}