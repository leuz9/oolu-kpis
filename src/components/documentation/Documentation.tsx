import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import DocHeader from './components/DocHeader';
import DocTabs from './components/DocTabs';
import DocNavigation from './components/DocNavigation';
import DocContent from './components/DocContent';
import { functionalDocs } from './data/functionalDocs';
import { technicalDocs } from './data/technicalDocs';
import type { DocSection, DocTab } from './types';

export default function Documentation() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<DocTab>('functional');
  const [selectedDoc, setSelectedDoc] = useState<DocSection>(functionalDocs[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [helpfulDocs, setHelpfulDocs] = useState<Set<string>>(new Set());
  const [unhelpfulDocs, setUnhelpfulDocs] = useState<Set<string>>(new Set());

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) {
      setSelectedDoc(activeTab === 'functional' ? functionalDocs[0] : technicalDocs[0]);
      return;
    }

    const docs = activeTab === 'functional' ? functionalDocs : technicalDocs;
    const matchingDoc = docs.find(doc => 
      doc.title.toLowerCase().includes(term.toLowerCase()) ||
      doc.content.overview.toLowerCase().includes(term.toLowerCase()) ||
      doc.content.sections.some(section => 
        section.title.toLowerCase().includes(term.toLowerCase()) ||
        section.content.toLowerCase().includes(term.toLowerCase())
      )
    );

    if (matchingDoc) {
      setSelectedDoc(matchingDoc);
    }
  };

  const handleFeedback = (docId: string, helpful: boolean) => {
    if (helpful) {
      setHelpfulDocs(prev => new Set(prev).add(docId));
      setUnhelpfulDocs(prev => {
        const newSet = new Set(prev);
        newSet.delete(docId);
        return newSet;
      });
    } else {
      setUnhelpfulDocs(prev => new Set(prev).add(docId));
      setHelpfulDocs(prev => {
        const newSet = new Set(prev);
        newSet.delete(docId);
        return newSet;
      });
    }
  };

  const handleTabChange = (tab: DocTab) => {
    setActiveTab(tab);
    setSelectedDoc(tab === 'functional' ? functionalDocs[0] : technicalDocs[0]);
  };

  const currentDocs = activeTab === 'functional' ? functionalDocs : technicalDocs;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="max-w-7xl mx-auto">
          <DocHeader 
            searchTerm={searchTerm}
            onSearch={handleSearch}
          />

          <DocTabs 
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          <div className="grid grid-cols-12 gap-8">
            <DocNavigation
              docs={currentDocs}
              selectedDoc={selectedDoc}
              onSelectDoc={setSelectedDoc}
              activeTab={activeTab}
            />

            <DocContent
              doc={selectedDoc}
              onFeedback={handleFeedback}
              helpfulDocs={helpfulDocs}
              unhelpfulDocs={unhelpfulDocs}
            />
          </div>
        </div>
      </div>
    </div>
  );
}