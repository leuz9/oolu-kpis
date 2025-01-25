import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { DocSection } from '../types';
import DocFeedback from './DocFeedback';

interface DocContentProps {
  doc: DocSection;
  onFeedback: (docId: string, helpful: boolean) => void;
  helpfulDocs: Set<string>;
  unhelpfulDocs: Set<string>;
}

export default function DocContent({ doc, onFeedback, helpfulDocs, unhelpfulDocs }: DocContentProps) {
  const Icon = doc.icon;

  return (
    <div className="col-span-9">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center mb-6">
          <Icon className="h-6 w-6" />
          <h2 className="text-2xl font-bold text-gray-900 ml-3">
            {doc.title}
          </h2>
        </div>

        <div className="prose max-w-none">
          <div className="bg-gray-50 border-l-4 border-primary-500 p-4 rounded mb-8">
            <p className="text-gray-600">
              {doc.content.overview}
            </p>
          </div>

          <div className="space-y-8">
            {doc.content.sections.map((section, index) => (
              <div key={index}>
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  {section.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {section.content}
                </p>
                {section.subsections && (
                  <div className="ml-6 space-y-4 mt-4">
                    {section.subsections.map((subsection, subIndex) => (
                      <div key={subIndex}>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          {subsection.title}
                        </h4>
                        <p className="text-gray-600 whitespace-pre-line">
                          {subsection.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {doc.content.examples && (
              <div className="mt-8">
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  Examples
                </h3>
                <div className="space-y-6">
                  {doc.content.examples.map((example, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {example.title}
                      </h4>
                      <p className="text-gray-600 mb-4">{example.description}</p>
                      {example.code && (
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                          <code>{example.code}</code>
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {doc.content.relatedTopics && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Related Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {doc.content.relatedTopics.map((topic, index) => (
                    <a
                      key={index}
                      href={`#${topic}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200"
                    >
                      {topic}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Feedback Section */}
          <DocFeedback
            docId={doc.id}
            onFeedback={onFeedback}
            isHelpful={helpfulDocs.has(doc.id)}
            isUnhelpful={unhelpfulDocs.has(doc.id)}
          />
        </div>
      </div>
    </div>
  );
}