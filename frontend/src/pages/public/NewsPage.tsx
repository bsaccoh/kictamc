import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi, NewsArticle } from '../../services/publicApi';
import {
  Calendar,
  User,
  ArrowRight,
  Search,
  Filter,
  FileText,
  Clock,
} from 'lucide-react';

export const NewsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: newsArticles, isLoading } = useQuery({
    queryKey: ['publicNews', selectedCategory, searchQuery],
    queryFn: () => publicApi.getNews(selectedCategory, searchQuery),
  });

  const categories = ['ALL', 'ADMISSION', 'ACADEMIC', 'ANNOUNCEMENT'];

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="bg-[#142D4E] text-white py-14 border-b border-[#203c62]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C69A43]">
              Official Communications
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              News &amp; Official Announcements
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Stay informed with official updates from the KICTAMC Registry, Academic Board, and Student Affairs.
            </p>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl border border-[#E1E6ED] p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#142D4E] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Notices' : cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search news &amp; announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C69A43]"
            />
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 bg-white rounded-xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : newsArticles && newsArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsArticles.map((article: NewsArticle) => (
              <article
                key={article.id}
                className="bg-white rounded-xl border border-[#E1E6ED] shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {article.featuredImage && (
                    <div className="h-48 overflow-hidden bg-slate-100">
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                        {article.category}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#C69A43]" />
                        {new Date(article.publishedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-[#142D4E] hover:text-[#C69A43] transition-colors leading-snug">
                      <Link to={`/news/${article.slug}`}>{article.title}</Link>
                    </h2>

                    <p className="text-xs text-[#697586] line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{article.author}</span>
                  <Link
                    to={`/news/${article.slug}`}
                    className="font-bold text-[#142D4E] hover:text-[#C69A43] flex items-center gap-1"
                  >
                    Read More <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-[#E1E6ED] space-y-2">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No announcements found</h3>
            <p className="text-xs text-slate-500">Try modifying your search query or category filter.</p>
          </div>
        )}
      </section>
    </div>
  );
};
