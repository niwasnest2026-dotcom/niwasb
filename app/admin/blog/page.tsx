'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaCalendarAlt, 
  FaUser, FaTag, FaClock, FaHeart, FaSearch 
} from 'react-icons/fa';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image: string;
  author: string;
  published_date: string;
  category: string;
  tags: string[];
  read_time: number;
  views: number;
  likes: number;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export default function AdminBlog() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Sample data - replace with actual database queries
  const samplePosts: BlogPost[] = [
    {
      id: '1',
      title: 'Top 10 Things to Consider When Choosing Your First PG',
      excerpt: 'Moving to a new city for work or studies? Here are the essential factors you should consider when selecting the perfect paying guest accommodation.',
      content: '',
      featured_image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=200&fit=crop',
      author: 'Priya Sharma',
      published_date: '2024-12-20',
      category: 'PG Tips',
      tags: ['PG', 'Accommodation', 'Tips', 'First Time'],
      read_time: 5,
      views: 1250,
      likes: 89,
      status: 'published',
      created_at: '2024-12-20T10:00:00Z',
      updated_at: '2024-12-20T10:00:00Z'
    },
    {
      id: '2',
      title: 'Co-living vs Traditional PG: Which is Right for You?',
      excerpt: 'Explore the differences between modern co-living spaces and traditional PG accommodations to make the best choice for your lifestyle.',
      content: '',
      featured_image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=200&fit=crop',
      author: 'Rahul Verma',
      published_date: '2024-12-18',
      category: 'Co-living',
      tags: ['Co-living', 'PG', 'Comparison', 'Lifestyle'],
      read_time: 7,
      views: 980,
      likes: 67,
      status: 'published',
      created_at: '2024-12-18T10:00:00Z',
      updated_at: '2024-12-18T10:00:00Z'
    },
    {
      id: '3',
      title: 'Budget-Friendly PG Options in Bangalore: Complete Guide',
      excerpt: 'Discover affordable yet comfortable PG accommodations in Bangalore with our comprehensive area-wise breakdown and pricing guide.',
      content: '',
      featured_image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=200&fit=crop',
      author: 'Anjali Reddy',
      published_date: '2024-12-15',
      category: 'City Guides',
      tags: ['Bangalore', 'Budget', 'PG', 'Guide'],
      read_time: 8,
      views: 1560,
      likes: 124,
      status: 'draft',
      created_at: '2024-12-15T10:00:00Z',
      updated_at: '2024-12-15T10:00:00Z'
    }
  ];

  const categories = ['All', 'PG Tips', 'Co-living', 'City Guides', 'Safety', 'Lifestyle', 'Legal'];
  const statuses = ['All', 'published', 'draft'];

  useEffect(() => {
    async function checkAdminAndFetch() {
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
        
        // In a real app, fetch blog posts from database
        // For now, use sample data
        setPosts(samplePosts);
      } catch (error) {
        console.error('Error:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      checkAdminAndFetch();
    }
  }, [user, authLoading, router]);

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      // In a real app, delete from database
      setPosts(posts.filter(post => post.id !== postId));
      alert('Blog post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete blog post');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || post.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link href="/admin" className="hover:underline mb-2 inline-block" style={{ color: '#2B7A78' }}>
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Blog Management</h1>
              <p className="text-gray-600 mt-2">Manage your property blog posts and articles</p>
            </div>
            <Link
              href="/admin/blog/add"
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
              style={{ backgroundColor: '#3AAFA9' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2B7A78'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
            >
              <FaPlus />
              Add New Post
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-primary"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-primary"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-primary"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'All' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center sm:justify-start text-gray-600">
              <span className="text-sm font-medium">
                {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredPosts.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Post
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Author & Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stats
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-4">
                              <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                <Image
                                  src={post.featured_image}
                                  alt={post.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                                  {post.title}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                                  {post.excerpt}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center gap-1">
                              <FaUser className="text-gray-400" />
                              {post.author}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <FaCalendarAlt className="text-gray-400" />
                              {formatDate(post.published_date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: '#3AAFA9' }}>
                              {post.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              post.status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {post.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <FaEye className="text-gray-400" />
                                {post.views}
                              </div>
                              <div className="flex items-center gap-1">
                                <FaHeart className="text-gray-400" />
                                {post.likes}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/blog/${post.id}`}
                                target="_blank"
                                className="p-2 rounded-lg transition-colors hover:shadow-lg"
                                style={{ color: '#3AAFA9', backgroundColor: 'rgba(58, 175, 169, 0.1)' }}
                                title="View Post"
                              >
                                <FaEye />
                              </Link>
                              <Link
                                href={`/admin/blog/edit/${post.id}`}
                                className="p-2 rounded-lg transition-colors hover:shadow-lg"
                                style={{ color: '#2B7A78', backgroundColor: 'rgba(43, 122, 120, 0.1)' }}
                                title="Edit Post"
                              >
                                <FaEdit />
                              </Link>
                              <button
                                onClick={() => handleDelete(post.id)}
                                className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Post"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4 p-4">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start space-x-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        <Image
                          src={post.featured_image}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">{post.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.excerpt}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full text-white" style={{ backgroundColor: '#3AAFA9' }}>
                            {post.category}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            post.status === 'published' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {post.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <div className="flex items-center gap-1 text-gray-600 mb-1">
                              <FaUser className="text-gray-400" />
                              <span className="truncate">{post.author}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <FaCalendarAlt className="text-gray-400" />
                              <span>{formatDate(post.published_date)}</span>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-gray-600 mb-1">
                              <FaEye className="text-gray-400" />
                              <span>{post.views} views</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <FaHeart className="text-gray-400" />
                              <span>{post.likes} likes</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/blog/${post.id}`}
                            target="_blank"
                            className="px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-all"
                            style={{ backgroundColor: '#3AAFA9' }}
                          >
                            View
                          </Link>
                          <Link
                            href={`/admin/blog/edit/${post.id}`}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg border-2 transition-all"
                            style={{ borderColor: '#2B7A78', color: '#2B7A78' }}
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first blog post'
                }
              </p>
              {(!searchQuery && selectedCategory === 'All' && selectedStatus === 'All') && (
                <Link
                  href="/admin/blog/add"
                  className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition-all"
                  style={{ backgroundColor: '#3AAFA9' }}
                >
                  <FaPlus />
                  Create First Post
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6" style={{ 
            background: 'linear-gradient(135deg, rgba(58, 175, 169, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%)',
            border: '1px solid rgba(58, 175, 169, 0.1)'
          }}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(58, 175, 169, 0.1)' }}>
                  <FaEdit style={{ color: '#3AAFA9' }} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Posts</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">{posts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6" style={{ 
            background: 'linear-gradient(135deg, rgba(43, 122, 120, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%)',
            border: '1px solid rgba(43, 122, 120, 0.1)'
          }}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                  <FaEye className="text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Published</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {posts.filter(p => p.status === 'published').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6" style={{ 
            background: 'linear-gradient(135deg, rgba(222, 242, 241, 0.3) 0%, rgba(255, 255, 255, 0.95) 100%)',
            border: '1px solid rgba(222, 242, 241, 0.5)'
          }}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)' }}>
                  <FaClock className="text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Drafts</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {posts.filter(p => p.status === 'draft').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6" style={{ 
            background: 'linear-gradient(135deg, rgba(58, 175, 169, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%)',
            border: '1px solid rgba(58, 175, 169, 0.1)'
          }}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                  <FaHeart className="text-red-500" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Likes</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {posts.reduce((sum, post) => sum + post.likes, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}