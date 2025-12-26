'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FaCalendarAlt, FaUser, FaTag, FaArrowLeft, FaClock, 
  FaEye, FaHeart, FaShare, FaFacebook, FaTwitter, FaLinkedin,
  FaWhatsapp, FaBookmark, FaRegBookmark
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

// Sample blog post data - replace with actual data from your database
const samplePost: BlogPost = {
  id: '1',
  title: 'Top 10 Things to Consider When Choosing Your First PG',
  excerpt: 'Moving to a new city for work or studies? Here are the essential factors you should consider when selecting the perfect paying guest accommodation.',
  content: `
    <h2>Introduction</h2>
    <p>Moving to a new city for work or studies can be both exciting and overwhelming. One of the most crucial decisions you'll make is choosing the right paying guest (PG) accommodation. This choice will significantly impact your comfort, safety, and overall experience in the new city.</p>
    
    <h2>1. Location and Connectivity</h2>
    <p>The location of your PG should be your top priority. Consider the following factors:</p>
    <ul>
      <li>Proximity to your workplace or educational institution</li>
      <li>Availability of public transportation</li>
      <li>Distance from metro stations or bus stops</li>
      <li>Traffic conditions during peak hours</li>
      <li>Nearby amenities like hospitals, markets, and ATMs</li>
    </ul>
    
    <h2>2. Safety and Security</h2>
    <p>Your safety should never be compromised. Look for:</p>
    <ul>
      <li>24/7 security guards</li>
      <li>CCTV surveillance in common areas</li>
      <li>Secure entry and exit points</li>
      <li>Well-lit surroundings</li>
      <li>Safe neighborhood with low crime rates</li>
    </ul>
    
    <h2>3. Room Types and Amenities</h2>
    <p>Different PGs offer various room configurations:</p>
    <ul>
      <li>Single occupancy rooms for privacy</li>
      <li>Double or triple sharing for cost-effectiveness</li>
      <li>Attached or shared bathrooms</li>
      <li>Air conditioning and heating facilities</li>
      <li>Storage space and furniture quality</li>
    </ul>
    
    <h2>4. Food and Meal Plans</h2>
    <p>Most PGs provide meal services, but quality varies:</p>
    <ul>
      <li>Hygiene standards in the kitchen</li>
      <li>Variety and quality of food</li>
      <li>Flexibility in meal timings</li>
      <li>Special dietary requirements accommodation</li>
      <li>Option to cook your own meals</li>
    </ul>
    
    <h2>5. Rules and Regulations</h2>
    <p>Every PG has its own set of rules. Make sure you're comfortable with:</p>
    <ul>
      <li>Visitor policies and timings</li>
      <li>Curfew hours</li>
      <li>Noise restrictions</li>
      <li>Smoking and drinking policies</li>
      <li>Guest accommodation rules</li>
    </ul>
    
    <h2>6. Cost and Payment Terms</h2>
    <p>Understand the complete cost structure:</p>
    <ul>
      <li>Monthly rent and security deposit</li>
      <li>Additional charges for utilities</li>
      <li>Maintenance and cleaning fees</li>
      <li>Payment schedules and methods</li>
      <li>Refund policies</li>
    </ul>
    
    <h2>7. Internet and Wi-Fi</h2>
    <p>In today's digital age, reliable internet is essential:</p>
    <ul>
      <li>Wi-Fi speed and reliability</li>
      <li>Coverage in all areas</li>
      <li>Data limits and restrictions</li>
      <li>Backup internet options</li>
    </ul>
    
    <h2>8. Laundry and Housekeeping</h2>
    <p>Daily maintenance services can make your life easier:</p>
    <ul>
      <li>Laundry facilities and services</li>
      <li>Room cleaning frequency</li>
      <li>Common area maintenance</li>
      <li>Bed linen and towel services</li>
    </ul>
    
    <h2>9. Social Environment</h2>
    <p>The people you live with can greatly impact your experience:</p>
    <ul>
      <li>Age group and background of residents</li>
      <li>Common areas for socializing</li>
      <li>Community activities and events</li>
      <li>Noise levels and lifestyle compatibility</li>
    </ul>
    
    <h2>10. Contract Terms and Flexibility</h2>
    <p>Before signing any agreement, carefully review:</p>
    <ul>
      <li>Minimum stay requirements</li>
      <li>Notice period for vacating</li>
      <li>Terms for early termination</li>
      <li>Renewal policies</li>
      <li>Dispute resolution procedures</li>
    </ul>
    
    <h2>Conclusion</h2>
    <p>Choosing the right PG is a decision that will affect your daily life for months or even years. Take your time to visit multiple options, ask questions, and trust your instincts. Remember, the cheapest option isn't always the best – prioritize your safety, comfort, and peace of mind.</p>
    
    <p>By considering these ten factors, you'll be well-equipped to make an informed decision and find a PG that truly feels like home.</p>
  `,
  featured_image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=600&fit=crop',
  author: 'Priya Sharma',
  published_date: '2024-12-20',
  category: 'PG Tips',
  tags: ['PG', 'Accommodation', 'Tips', 'First Time'],
  read_time: 5,
  views: 1250,
  likes: 89
};

export default function BlogPost() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    // In a real app, fetch the post from your database using params.id
    // For now, we'll use the sample post
    setTimeout(() => {
      setPost(samplePost);
      setLoading(false);
    }, 500);
  }, [params.id]);

  const handleLike = () => {
    setLiked(!liked);
    // In a real app, update the like count in your database
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    // In a real app, save/remove bookmark in your database
  };

  const handleShare = (platform: string) => {
    if (!post) return;
    
    const url = window.location.href;
    const title = post.title;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    setShowShareMenu(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h1>
          <Link href="/blog" className="text-primary hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-teal via-neutral-white to-soft-teal">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-secondary hover:text-neutral font-semibold transition-colors mb-6"
        >
          <FaArrowLeft />
          Back to Blog
        </Link>
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 pb-12">
        <div className="saas-card rounded-2xl overflow-hidden border-gradient shadow-xl">
          {/* Featured Image */}
          <div className="relative h-64 md:h-96">
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-neutral/20 via-transparent to-neutral/60" />
            
            {/* Category Badge */}
            <div className="absolute top-6 left-6">
              <span className="px-4 py-2 bg-primary/90 backdrop-blur-md text-neutral-white font-bold rounded-xl shadow-lg">
                {post.category}
              </span>
            </div>
            
            {/* Action Buttons */}
            <div className="absolute top-6 right-6 flex gap-3">
              <button
                onClick={handleBookmark}
                className="w-12 h-12 bg-neutral-white/90 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-neutral-white transition-all shadow-lg"
              >
                {bookmarked ? (
                  <FaBookmark className="text-secondary" />
                ) : (
                  <FaRegBookmark className="text-neutral" />
                )}
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="w-12 h-12 bg-neutral-white/90 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-neutral-white transition-all shadow-lg"
                >
                  <FaShare className="text-neutral" />
                </button>
                
                {showShareMenu && (
                  <div className="absolute top-14 right-0 bg-neutral-white rounded-xl shadow-xl border border-primary/10 p-2 z-10">
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      <FaFacebook className="text-blue-600" />
                      <span className="text-sm font-medium">Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      <FaTwitter className="text-blue-400" />
                      <span className="text-sm font-medium">Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      <FaLinkedin className="text-blue-700" />
                      <span className="text-sm font-medium">LinkedIn</span>
                    </button>
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      <FaWhatsapp className="text-green-600" />
                      <span className="text-sm font-medium">WhatsApp</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Article Content */}
          <div className="p-8 md:p-12">
            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-neutral/70 mb-6">
              <div className="flex items-center gap-2">
                <FaUser className="text-secondary" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-secondary" />
                <span>{formatDate(post.published_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaClock className="text-secondary" />
                <span>{post.read_time} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <FaEye className="text-secondary" />
                <span>{post.views} views</span>
              </div>
            </div>
            
            {/* Title */}
            <h1 className="font-merriweather text-3xl md:text-4xl font-bold text-neutral mb-6">
              {post.title}
            </h1>
            
            {/* Excerpt */}
            <p className="text-xl text-neutral/80 mb-8 leading-relaxed">
              {post.excerpt}
            </p>
            
            {/* Content */}
            <div 
              className="prose prose-lg max-w-none prose-headings:font-merriweather prose-headings:text-neutral prose-p:text-neutral/80 prose-li:text-neutral/80 prose-strong:text-neutral prose-a:text-secondary hover:prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-primary/10">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <FaTag className="text-secondary" />
                <span className="font-semibold text-neutral">Tags:</span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary/10 border border-primary/20 text-secondary text-sm font-medium rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Like Button */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    liked
                      ? 'bg-secondary text-neutral-white'
                      : 'bg-primary/10 border border-primary/20 text-secondary hover:bg-primary/20'
                  }`}
                >
                  <FaHeart />
                  <span>{liked ? post.likes + 1 : post.likes} Likes</span>
                </button>
                
                <div className="text-sm text-neutral/70">
                  Was this article helpful?
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Articles */}
        <div className="mt-16">
          <h2 className="font-merriweather text-3xl font-bold text-neutral mb-8 text-center">
            Related Articles
          </h2>
          <div className="text-center py-12">
            <p className="text-neutral/70 mb-6">More great articles coming soon!</p>
            <Link
              href="/blog"
              className="saas-button-primary px-6 py-3 rounded-xl font-semibold"
            >
              Browse All Articles
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}