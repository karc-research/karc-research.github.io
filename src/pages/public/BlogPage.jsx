import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../contexts/LangContext'
import { Card, CardContent } from '@/components/ui/card'
import iconCollaboration from '../../assets/icons/icon-collaboration.png'

export default function BlogPage() {
  const { t, lang } = useLang()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    if (!supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, subtitle, excerpt, published_at, author:profiles(full_name)')
      .eq('published', true)
      .order('published_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16">
        <div className="mx-auto max-w-6xl px-4 flex items-start gap-6">
          <img src={iconCollaboration} alt="" className="hidden sm:block h-20 w-20 object-contain flex-shrink-0 mt-1" />
          <div>
            <h1 className="text-4xl font-bold text-slate-900">{t('blog.title')}</h1>
            <p className="mt-4 max-w-3xl text-xl text-slate-600 leading-relaxed">
              {t('blog.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          {posts.length === 0 ? (
            <p className="text-center text-slate-500">{t('blog.noPosts')}</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {posts.map((post) => (
                <Link key={post.id} to={`/blog/${post.id}`} className="group">
                  <Card className="h-full py-0 transition-all hover:border-primary-300 hover:shadow-md">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">
                        {post.title}
                      </h2>
                      {post.subtitle && (
                        <p className="mt-1 text-base text-slate-500">{post.subtitle}</p>
                      )}
                      {post.excerpt && (
                        <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          {post.author?.full_name && <span>{post.author.full_name}</span>}
                          <span>{new Date(post.published_at).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US')}</span>
                        </div>
                        <span className="text-sm font-medium text-primary-600 group-hover:text-primary-700">
                          {t('blog.readMore')} &rarr;
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
