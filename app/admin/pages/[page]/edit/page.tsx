'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import RichTextEditor from '@/components/admin/RichTextEditor'
import ImageUploader from '@/components/admin/ImageUploader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function PageEditor() {
  const params = useParams()
  const page = params.page as string
  const supabase = createClient()
  
  const [content, setContent] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPageContent()
  }, [page])

  const fetchPageContent = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from(`${page}_content`)
        .select('*')
        .order('order_index')

      if (error) throw error

      if (data) {
     
        const contentObj: any = {}
        data.forEach(item => {
          contentObj[item.section] = item
        })
        setContent(contentObj)
      }
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {

      for (const [section, data] of Object.entries(content)) {
        const { error } = await supabase
          .from(`${page}_content`)
          .update({
            content: (data as any).content,
            updated_at: new Date().toISOString()
          })
          .eq('section', section)

        if (error) throw error
      }

      alert('Page updated successfully!')
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error saving changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 capitalize">
          Edit {page.replace('_', ' ')} Page
        </h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {Object.entries(content).map(([section, data]: [string, any]) => (
        <div key={section} className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 capitalize">
            {section.replace('_', ' ')} Section
          </h2>
          
          <div className="space-y-4">
            <Input
              label="Title"
              value={data.title || ''}
              onChange={(e) => setContent({
                ...content,
                [section]: { ...data, title: e.target.value }
              })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <RichTextEditor
                value={data.content || ''}
                onChange={(value) => setContent({
                  ...content,
                  [section]: { ...data, content: value }
                })}
              />
            </div>

            <ImageUploader
              label="Image"
              currentImage={data.image_url}
              onImageUpload={(url) => setContent({
                ...content,
                [section]: { ...data, image_url: url }
              })}
            />
          </div>
        </div>
      ))}
    </div>
  )
}