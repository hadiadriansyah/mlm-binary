'use client'

import { useEffect, useRef, useState } from 'react'
import Tree from 'react-d3-tree'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function TreeD3() {
  const [treeData, setTreeData] = useState<any[]>([])
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [isEdit, setIsEdit] = useState(false)
  const [isAddChild, setIsAddChild] = useState(false)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [downlineCount, setDownlineCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    fetchTree()
  }, [])

  const fetchTree = async () => {
    const res = await fetch(`${API_URL}/members/tree`)
    const data = await res.json()
    setTreeData(data)
  }

  useEffect(() => {
    if (wrapperRef.current && treeData.length > 0) {
      const { width, height } = wrapperRef.current.getBoundingClientRect()
      setTranslate({ x: width / 2, y: height / 4 })
    }
  }, [treeData])

  const countDownlines = (node: any): number => {
    if (!node.children || node.children.length === 0) return 0
    return node.children.reduce((acc: number, child: any) => acc + 1 + countDownlines(child), 0)
  }

  const handleNodeClick = (nodeDatum: any) => {
    setSelectedNode(nodeDatum)
    setFormData({
      name: nodeDatum.name,
      email: nodeDatum.attributes?.email || '',
      phone: nodeDatum.attributes?.phone || '',
    })
    setIsEdit(true)
    setIsAddChild(false)
    setDownlineCount(countDownlines(nodeDatum))
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required.')
      return
    }

    const isNew = !isEdit
    const method = isEdit ? 'PUT' : 'POST'
    const endpoint = isEdit
      ? `${API_URL}/members/${selectedNode.id}`
      : `${API_URL}/members`

    const payload = {
      ...formData,
      uplineId: isAddChild
        ? selectedNode?.id
        : selectedNode?.attributes?.uplineId ?? null,
    }

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error.message || 'An error occurred.')
        return
      }

      toast.success(isNew ? 'Member created successfully.' : 'Member updated.')
      setShowModal(false)
      fetchTree()
    } catch {
      toast.error('Network or server error occurred.')
    }
  }

  const handleDelete = async () => {
    if (!selectedNode?.id) return
    try {
      const res = await fetch(`${API_URL}/members/${selectedNode.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error.message || 'Failed to delete member.')
        return
      }

      toast.success('Member deleted.')
      setShowModal(false)
      fetchTree()
    } catch {
      toast.error('Failed to delete member. Network or server error.')
    }
  }

  const handleCascadeDelete = async () => {
    if (!selectedNode?.id) return
    try {
      const res = await fetch(`${API_URL}/members/cascade/${selectedNode.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error.message || 'Failed to delete subtree.')
        return
      }

      toast.success('Member and all downlines deleted.')
      setShowModal(false)
      fetchTree()
    } catch {
      toast.error('Failed to delete subtree. Network or server error.')
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    try {
      const res = await fetch(`${API_URL}/members?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()

      if (!data.length) {
        toast.error('No members found.')
        setSearchResults([])
        setHighlightedId(null)
        return
      }

      setSearchResults(data)
      setHighlightedId(data[0].id.toString())

      setTimeout(() => {
        const nodeEl = document.querySelector(`[data-nodeid="${data[0].id}"]`) as SVGGElement
        const container = wrapperRef.current
        if (nodeEl && container) {
          const nodeRect = nodeEl.getBoundingClientRect()
          const containerRect = container.getBoundingClientRect()
          const offsetX = nodeRect.left - containerRect.left
          const offsetY = nodeRect.top - containerRect.top
          const centerX = container.clientWidth / 2
          const centerY = container.clientHeight / 2
          setTranslate(prev => ({
            x: prev.x - (offsetX - centerX),
            y: prev.y - (offsetY - centerY),
          }))
        }
      }, 300)
    } catch {
      toast.error('Failed to perform search.')
    }
  }

  const renderCustomNode = ({ nodeDatum, toggleNode }: any) => {
    const { name, attributes, id } = nodeDatum
    const isHighlighted = highlightedId === id?.toString()
    return (
      <g className="cursor-pointer" data-nodeid={id}>
        <circle r={15} fill={isHighlighted ? '#16a34a' : '#0ea5e9'} onClick={toggleNode} />
        <text fill="white" x="0" y="5" textAnchor="middle" fontSize="12" onClick={toggleNode}>
          {(name.charAt(0) || '?').toUpperCase()}
        </text>
        <g className="rd3t-label" onClick={() => handleNodeClick(nodeDatum)}>
          <text textAnchor="start" x="40" fill="#333" fontWeight="bold">
            {name}
          </text>
          {attributes?.email && (
            <text x="40" dy="1.2em" fill="#555" fontSize="12">
              email: {attributes.email}
            </text>
          )}
          {attributes?.phone && (
            <text x="40" dy="2.4em" fill="#555" fontSize="12">
              phone: {attributes.phone}
            </text>
          )}
        </g>
      </g>
    )
  }

  return (
    <div className="w-full h-screen p-4 relative z-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">MLM Binary Tree</h2>
        {treeData.length === 0 && (
          <Button
            onClick={() => {
              setFormData({ name: '', email: '', phone: '' })
              setSelectedNode(null)
              setIsEdit(false)
              setIsAddChild(false)
              setShowModal(true)
            }}
          >
            + Add Root Member
          </Button>
        )}
      </div>

      <div className="mb-4 max-w-md">
        <Input
          placeholder="Search by name, email, or phone"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="mb-2"
        />
        <Button onClick={handleSearch}>Search</Button>
        {searchResults.length > 0 && (
          <div className="mt-4 bg-gray-50 p-3 rounded border">
            <p className="text-sm mb-1 font-semibold">Search Result:</p>
            <p>🔍 <strong>{searchResults[0].name}</strong></p>
            {searchResults[0].upline && (
              <p>↖️ Upline: {searchResults[0].upline.name}</p>
            )}
            {searchResults[0].downlines?.length > 0 && (
              <p>↘️ Downlines: {searchResults[0].downlines.map((d: any) => d.name).join(', ')}</p>
            )}
          </div>
        )}
      </div>

      <div ref={wrapperRef} className="w-full h-[75vh] border rounded bg-white shadow overflow-auto">
        {treeData.map((data, i) => (
          <Tree
            key={i}
            data={data}
            orientation="vertical"
            pathFunc="diagonal"
            separation={{ siblings: 2, nonSiblings: 2.5 }}
            translate={translate}
            transitionDuration={500}
            scaleExtent={{ min: 0.5, max: 1.5 }}
            renderCustomNodeElement={renderCustomNode}
            collapsible={true}
            enableLegacyTransitions={true}
          />
        ))}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <DialogContent className="fixed z-50 bg-white p-6 shadow-lg rounded-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md">
            <DialogHeader>
              <DialogTitle>{isEdit ? 'Edit Member' : isAddChild ? 'Add Downline' : 'Add Root Member'}</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mb-2"
            />
            <Input
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mb-2"
            />
            <Input
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mb-4"
            />
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button onClick={handleSubmit}>
                  {isEdit ? 'Save Changes' : 'Add Member'}
                </Button>
                {isEdit && (
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setIsEdit(false)
                      setIsAddChild(true)
                      setFormData({ name: '', email: '', phone: '' })
                    }}
                  >
                    + Add Downline
                  </Button>
                )}
              </div>
              {isEdit && (
                <Button className="bg-red-600 hover:bg-red-700" onClick={() => setShowConfirmDialog(true)}>
                  Delete
                </Button>
              )}
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <DialogContent className="fixed z-50 bg-white p-6 shadow-lg rounded-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600 mb-4">
              This member has {downlineCount} downline{downlineCount !== 1 ? 's' : ''}. What do you want to do?
            </p>
            <div className="flex justify-between">
              <Button className="bg-red-600 hover:bg-red-700" onClick={async () => {
                setShowConfirmDialog(false)
                await handleDelete()
              }}>
                Delete Only
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={async () => {
                setShowConfirmDialog(false)
                await handleCascadeDelete()
              }}>
                Delete + Downlines
              </Button>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  )
}
