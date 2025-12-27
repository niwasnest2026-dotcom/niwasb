'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { FaSave, FaEye, FaImage, FaTag, FaArrowLeft } from 'react-icons/fa';

export default function AddBlogPost() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featured_image: '',
    author: '',
    category: 'PG Tips',
    tags: '',
    read_time: 5,
    status: 'draft' as 'draft' | 'published'
  });

  const categories = ['PG Tips', 'Co-living', 'City Guides', 'Safety', 'Lifestyle', 'Legal'];

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        router.push('/');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (!data || !(data as any).is_admin) {
          router.push('/');
          return;
        }

        setIsAdmin(true);
        
        // Set default author to current user's email
        setFormData(prev => ({
          ...prev,
          author: user.email || ''
        }));
      } catch (error) {
        console.error('Error:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      checkAdmin();
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // In a real app, save to database
      const blogPost = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        published_date: new Date().toISOString().split('T')[0],
        views: 0,
        likes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Blog post to save:', blogPost);
      
      alert(`Blog post ${formData.status === 'published' ? 'published' : 'saved as draft'} successfully!`);
      router.push('/admin/blog');
    } catch (error: any) {
      console.error('Error saving blog post:', error);
      alert(`Failed to save blog post: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  // Update read time when content changes
  useEffect(() => {
    const readTime = estimateReadTime(formData.content);
    setFormData(prev => ({
      ...prev,
      read_time: readTime
    }));
  }, [formData.content]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ 
      background: 'linear-gradient(135deg, #DEF2F1 0%, #FEFFFF 50%, #DEF2F1 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link href="/admin/blog" className="hover:underline mb-2 inline-flex items-center gap-2" style={{ color: '#2B7A78' }}>
            <FaArrowLeft />
            Back to Blog Management
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Blog Post</h1>
          <p className="text-gray-600 mt-2">Create a new article for your property blog</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter blog post title..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base sm:text-lg"
              />
            </div>

            {/* Excerpt */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt *
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Brief description of the blog post (shown in listings)..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.excerpt.length}/200 characters recommended
              </p>
            </div>

            {/* Content */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Content *
                </label>
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: previewMode ? '#3AAFA9' : 'rgba(58, 175, 169, 0.1)', 
                    color: previewMode ? 'white' : '#2B7A78' 
                  }}
                >
                  <FaEye />
                  {previewMode ? 'Edit' : 'Preview'}
                </button>
              </div>
              
              {previewMode ? (
                <div className="w-full min-h-[300px] sm:min-h-[400px] p-4 border border-gray-300 rounded-lg bg-gray-50">
                  <div 
                    className="prose max-w-none text-sm sm:text-base"
                    dangerouslySetInnerHTML={{ __html: formData.content.replace(/\n/g, '<br>') }}
                  />
                </div>
              ) : (
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={15}
                  placeholder="Write your blog post content here... You can use HTML tags for formatting."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                />
              )}
              <p className="text-sm text-gray-500 mt-1">
                Estimated read time: {formData.read_time} minute{formData.read_time !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Post Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaImage className="inline mr-1" />
                  Featured Image URL *
                </label>
                <input
                  type="url"
                  name="featured_image"
                  value={formData.featured_image}
                  onChange={handleChange}
                  required
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author *
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                  placeholder="Author name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaTag className="inline mr-1" />
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="PG, Tips, Guide (comma separated)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Separate tags with commas
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publication Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="draft">Save as Draft</option>
                  <option value="published">Publish Now</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link
                  href="/admin/blog"
                  className="px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                  style={{ backgroundColor: '#3AAFA9' }}
                  onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#2B7A78')}
                  onMouseLeave={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#3AAFA9')}
                >
                  <FaSave />
                  {submitting 
                    ? 'Saving...' 
                    : formData.status === 'published' 
                      ? 'Publish Post' 
                      : 'Save Draft'
                  }
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}