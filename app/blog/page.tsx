'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FaCalendarAlt, FaUser, FaTag, FaArrowRight, FaSearch, 
  FaClock, FaEye, FaHeart, FaShare 
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
}

// Sample blog posts data - replace with actual data from your database
const samplePosts: BlogPost[] = [
  {
    id: '1',
    title: 'Top 10 Things to Consider When Choosing Your First PG',
    excerpt: 'Moving to a new city for work or studies? Here are the essential factors you should consider when selecting the perfect paying guest accommodation.',
    content: '',
    featured_image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=400&fit=crop',
    author: 'Priya Sharma',
    published_date: '2024-12-20',
    category: 'PG Tips',
    tags: ['PG', 'Accommodation', 'Tips', 'First Time'],
    read_time: 5,
    views: 1250,
    likes: 89
  },
  {
    id: '2',
    title: 'Co-living vs Traditional PG: Which is Right for You?',
    excerpt: 'Explore the differences between modern co-living spaces and traditional PG accommodations to make the best choice for your lifestyle.',
    content: '',
    featured_image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=400&fit=crop',
    author: 'Rahul Verma',
    published_date: '2024-12-18',
    category: 'Co-living',
    tags: ['Co-living', 'PG', 'Comparison', 'Lifestyle'],
    read_time: 7,
    views: 980,
    likes: 67
  },
  {
    id: '3',
    title: 'Budget-Friendly PG Options in Bangalore: Complete Guide',
    excerpt: 'Discover affordable yet comfortable PG accommodations in Bangalore with our comprehensive area-wise breakdown and pricing guide.',
    content: '',
    featured_image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=400&fit=crop',
    author: 'Anjali Reddy',
    published_date: '2024-12-15',
    category: 'City Guides',
    tags: ['Bangalore', 'Budget', 'PG', 'Guide'],
    read_time: 8,
    views: 1560,
    likes: 124
  },
  {
    id: '4',
    title: 'Safety Tips for Women in PG Accommodations',
    excerpt: 'Essential safety guidelines and red flags to watch out for when choosing and living in PG accommodations as a woman.',
    content: '',
    featured_image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=400&fit=crop',
    author: 'Meera Joshi',
    published_date: '2024-12-12',
    category: 'Safety',
    tags: ['Safety', 'Women', 'PG', 'Security'],
    read_time: 6,
    views: 2100,
    likes: 156
  },
  {
    id: '5',
    title: 'How to Make Your PG Room Feel Like Home',
    excerpt: 'Transform your small PG room into a cozy, personalized space with these creative decoration and organization tips.',
    content: '',
    featured_image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop',
    author: 'Karan Singh',
    published_date: '2024-12-10',
    category: 'Lifestyle',
    tags: ['Decoration', 'Room', 'Tips', 'Lifestyle'],
    read_time: 4,
    views: 890,
    likes: 78
  },
  {
    id: '6',
    title: 'Understanding PG Rules and Regulations: A Complete Guide',
    excerpt: 'Navigate the common rules and regulations in PG accommodations and know your rights as a tenant.',
    content: '',
    featured_image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=400&fit=crop',
    author: 'Vikash Kumar',
    published_date: '2024-12-08',
    category: 'Legal',
    tags: ['Rules', 'Legal', 'Rights', 'PG'],
    read_time: 9,
    views: 1340,
    likes: 92
  }
];

const categories = ['All', 'PG Tips', 'Co-living', 'City Guides', 'Safety', 'Lifestyle', 'Legal'];

export default function PropertyBlog() {
  const [posts, setPosts] = useState<BlogPost[]>(samplePosts);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(samplePosts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    filterPosts();
  }, [selectedCategory, searchQuery]);

  const filterPosts = () => {
    let filtered = posts;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredPosts(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-teal via-neutral-white to-soft-teal">
      {/* Hero Section */}
      <div className="saas-hero py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="font-merriweather text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Property Blog
          </h1>
          <p className="text-xl md:text-2xl text-neutral-white/90 mb-8 max-w-3xl mx-auto">
            Expert insights, tips, and guides for finding your perfect accommodation
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary text-lg" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, tips, guides..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-primary/20 focus:border-secondary outline-none text-neutral bg-neutral-white placeholder-neutral/50 text-lg font-medium transition-all duration-300 focus:shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedCategory === category
                    ? 'saas-button-primary shadow-lg'
                    : 'bg-neutral-white border-2 border-primary/20 text-neutral hover:border-secondary hover:shadow-md'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {filteredPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="font-merriweather text-3xl font-bold text-neutral mb-8 text-center">
              Featured Article
            </h2>
            <div className="saas-card rounded-2xl overflow-hidden border-gradient shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="md:flex">
                <div className="md:w-1/2 relative h-64 md:h-auto">
                  <Image
                    src={filteredPosts[0].featured_image}
                    alt={filteredPosts[0].title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-primary/90 backdrop-blur-md text-neutral-white text-sm font-bold rounded-lg shadow-lg">
                      {filteredPosts[0].category}
                    </span>
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center gap-4 text-sm text-neutral/70 mb-4">
                    <div className="flex items-center gap-1">
                      <FaUser className="text-secondary" />
                      <span>{filteredPosts[0].author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt className="text-secondary" />
                      <span>{formatDate(filteredPosts[0].published_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaClock className="text-secondary" />
                      <span>{filteredPosts[0].read_time} min read</span>
                    </div>
                  </div>
                  
                  <h3 className="font-merriweather text-2xl font-bold text-neutral mb-4 line-clamp-2">
                    {filteredPosts[0].title}
                  </h3>
                  
                  <p className="text-neutral/80 mb-6 line-clamp-3">
                    {filteredPosts[0].excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-neutral/70">
                      <div className="flex items-center gap-1">
                        <FaEye className="text-secondary" />
                        <span>{filteredPosts[0].views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaHeart className="text-secondary" />
                        <span>{filteredPosts[0].likes}</span>
                      </div>
                    </div>
                    
                    <Link
                      href={`/blog/${filteredPosts[0].id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-neutral text-neutral-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
                    >
                      Read More
                      <FaArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="mb-12">
          <h2 className="font-merriweather text-3xl font-bold text-neutral mb-8 text-center">
            Latest Articles
          </h2>
          
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.slice(1).map((post) => (
                <article
                  key={post.id}
                  className="saas-card rounded-xl overflow-hidden border-gradient shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.featured_image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-neutral/20 via-transparent to-neutral/40" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 bg-primary/90 backdrop-blur-md text-neutral-white text-xs font-bold rounded-lg shadow-lg">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-neutral/70 mb-3">
                      <div className="flex items-center gap-1">
                        <FaUser className="text-secondary" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaClock className="text-secondary" />
                        <span>{post.read_time} min</span>
                      </div>
                    </div>
                    
                    <h3 className="font-merriweather text-lg font-bold text-neutral mb-3 line-clamp-2 group-hover:text-secondary transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-neutral/80 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-neutral/70">
                        <div className="flex items-center gap-1">
                          <FaEye className="text-secondary" />
                          <span>{post.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaHeart className="text-secondary" />
                          <span>{post.likes}</span>
                        </div>
                      </div>
                      
                      <Link
                        href={`/blog/${post.id}`}
                        className="inline-flex items-center gap-1 text-secondary hover:text-neutral font-semibold text-sm transition-colors"
                      >
                        Read More
                        <FaArrowRight className="text-xs" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="font-merriweather text-2xl font-bold text-neutral mb-4">
                No articles found
              </h3>
              <p className="text-neutral/70 mb-6">
                Try adjusting your search or category filter
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="saas-button-primary px-6 py-3 rounded-xl font-semibold"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Newsletter Signup */}
        <div className="saas-card rounded-2xl p-8 md:p-12 text-center border-gradient shadow-xl">
          <h3 className="font-merriweather text-3xl font-bold text-neutral mb-4">
            Stay Updated
          </h3>
          <p className="text-neutral/80 mb-8 max-w-2xl mx-auto">
            Get the latest property tips, market insights, and accommodation guides delivered to your inbox
          </p>
          
          <div className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-primary/20 focus:border-secondary outline-none text-neutral bg-neutral-white placeholder-neutral/50 transition-all duration-300"
            />
            <button className="saas-button-primary px-6 py-3 rounded-xl font-semibold whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}