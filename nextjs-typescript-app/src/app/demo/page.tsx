'use client';

import React from 'react';
import { Header, Card } from '@/components';
import { formatDate, capitalize } from '@/utils/helpers';
import { User, Post } from '@/types';

export default function DemoPage() {
  // Example data using TypeScript types
  const user: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date()
  };

  const posts: Post[] = [
    {
      id: '1',
      title: 'Getting Started with Next.js',
      content: 'Learn how to build modern web applications with Next.js and TypeScript.',
      author: user,
      publishedAt: new Date(),
      tags: ['nextjs', 'react', 'typescript']
    },
    {
      id: '2',
      title: 'TypeScript Best Practices',
      content: 'Discover the best practices for writing maintainable TypeScript code.',
      author: user,
      publishedAt: new Date(),
      tags: ['typescript', 'javascript', 'programming']
    }
  ];

  const handleCardClick = (postId: string) => {
    console.log(`Clicked on post: ${postId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Next.js TypeScript Demo" 
        subtitle="Demonstrating TypeScript imports and type safety"
      />
      
      <main className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Welcome, {capitalize(user.name)}</h2>
          <p className="text-gray-600">
            Member since: {formatDate(user.createdAt)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card
              key={post.id}
              title={post.title}
              description={`${post.content} Published on ${formatDate(post.publishedAt)}`}
              onClick={() => handleCardClick(post.id)}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
            />
          ))}
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">TypeScript Features Demonstrated:</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✅ Path mapping with <code className="bg-gray-100 px-2 py-1 rounded">@/*</code> alias</li>
            <li>✅ Type-safe component props and interfaces</li>
            <li>✅ Utility functions with proper typing</li>
            <li>✅ Custom type definitions</li>
            <li>✅ Import/export from index files</li>
            <li>✅ Client-side components with TypeScript</li>
          </ul>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-lg font-semibold text-blue-800 mb-2">🚀 Back to 3D Homepage</h4>
            <p className="text-blue-700 mb-3">
              Return to the stunning 3D hero section with React Three Fiber animations.
            </p>
            <a 
              href="/" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Homepage
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}