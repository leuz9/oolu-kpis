import React from 'react';
import { marked } from 'marked';
import { ThumbsUp, ThumbsDown, ArrowLeft } from 'lucide-react';
import type { SupportArticle } from '../../../types';

interface ArticleViewProps {
  article: SupportArticle;
  onBack: () => void;
  onRate: (helpful: boolean) => Promise<void>;
  userRating?: 'helpful' | 'not_helpful';
}

export default function ArticleView({ article, onBack, onRate, userRating }: ArticleViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Articles
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{article.title}</h1>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <span>Last updated: {new Date(article.lastUpdated).toLocaleDateString()}</span>
          <span className="mx-2">•</span>
          <span>By {article.author}</span>
        </div>
      </div>

      <div className="p-6">
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: marked(article.content) }}
        />

        <div className="mt-8 pt-6 border-t">
          <h3 className="text-sm font-medium text-gray-900">Was this article helpful?</h3>
          <div className="mt-2 flex items-center space-x-4">
            <button
              onClick={() => onRate(true)}
              disabled={userRating === 'helpful'}
              className={`flex items-center px-4 py-2 rounded-md text-sm ${
                userRating === 'helpful'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Yes ({article.helpful})
            </button>
            <button
              onClick={() => onRate(false)}
              disabled={userRating === 'not_helpful'}
              className={`flex items-center px-4 py-2 rounded-md text-sm ${
                userRating === 'not_helpful'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              No ({article.notHelpful})
            </button>
          </div>
        </div>

        {article.tags.length > 0 && (
          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}