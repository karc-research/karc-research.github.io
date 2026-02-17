import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../contexts/LangContext'
import { ArrowLeft } from 'lucide-react'

function renderContent(text) {
  if (!text) return null
  return text.split('\n').map((line, i) => {
    // Convert **bold** to <strong>
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    const elements = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>
      }
      return part
    })

    if (line.trim() === '') return <br key={i} />
    return <p key={i} className="mb-4 text-lg text-slate-700 leading-relaxed">{elements}</p>
  })
}

export default function BlogPostPage() {
  const { id } = useParams()
  const { t, lang } = useLang()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPost()
  }, [id])

  async function fetchPost() {
    if (!supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('blog_posts')
      .select('*, author:profiles(full_name)')
      .eq('id', id)
      .eq('published', true)
      .single()
    setPost(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">{t('blog.noPosts')}</p>
        <Link to="/blog" className="mt-4 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700">
          <ArrowLeft className="h-4 w-4" />
          {t('blog.backToList')}
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16">
        <div className="mx-auto max-w-3xl px-4">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('blog.backToList')}
          </Link>
          <h1 className="text-4xl font-bold text-slate-900">{post.title}</h1>
          {post.subtitle && (
            <p className="mt-3 text-xl text-slate-500">{post.subtitle}</p>
          )}
          <div className="mt-6 flex items-center gap-3 text-sm text-slate-400">
            {post.author?.full_name && <span>{post.author.full_name}</span>}
            <span>{new Date(post.published_at).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4">
          <article className="prose prose-slate max-w-none">
            {renderContent(post.content)}
          </article>
        </div>
      </section>
    </div>
  )
}
