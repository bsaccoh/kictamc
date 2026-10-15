import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi, NewsArticle } from '../../services/publicApi';
import {
  Calendar,
  User,
  ArrowLeft,
  Share2,
  FileText,
  ShieldAlert,
  Clock,
} from 'lucide-react';

export const NewsDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ['publicNewsArticle', slug],
    queryFn: () => publicApi.getNewsArticle(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="h-64 bg-white rounded-xl animate-pulse border border-slate-200" />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-[#142D4E]">Notice Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          The requested announcement could not be found or has not been published yet.
        </p>
        <Link
          to="/news"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#142D4E] rounded-md"
        >
          <ArrowLeft className="w-4 h-4" /> Back to News &amp; Announcements
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="bg-[#142D4E] text-white py-12 border-b border-[#203c62]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Link
            to="/news"
            className="inline-flex items-center gap-1.5 text-xs text-[#C69A43] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to News &amp; Announcements
          </Link>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs">
              <span className="px-2.5 py-0.5 rounded font-bold uppercase tracking-wider bg-amber-400 text-slate-900">
                {article.category}
              </span>
              <span className="text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#C69A43]" />
                {new Date(article.publishedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="text-slate-300">&bull; {article.author}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              {article.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <article className="bg-white rounded-2xl border border-[#E1E6ED] shadow-sm p-6 sm:p-10 space-y-6">
          {article.featuredImage && (
            <div className="rounded-xl overflow-hidden max-h-96 bg-slate-100">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="border-b border-[#E1E6ED] pb-4">
            <p className="text-sm sm:text-base font-semibold text-[#142D4E] leading-relaxed italic">
              {article.summary}
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-[#202B3C] leading-relaxed whitespace-pre-line space-y-4">
            {article.content}
          </div>

          <div className="pt-6 border-t border-[#E1E6ED] flex items-center justify-between text-xs text-slate-500">
            <span>Published by: {article.author}</span>
            <Link
              to="/apply"
              className="px-4 py-2 font-bold text-slate-900 bg-[#C69A43] hover:bg-[#d8a94d] rounded-md shadow"
            >
              Apply for Admission
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
};
