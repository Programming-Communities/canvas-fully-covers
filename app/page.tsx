import BlogList from "@/components/blog/BlogList";
import Layout from "@/components/layout/Layout";
import { getPosts } from '@/lib/wordpress';

// Server component for SSR
export default async function Home() {
  try {
    const initialPosts = await getPosts();
    
    console.log('Fetched posts:', initialPosts?.length || 0);
    
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Welcome to Al-Asr</h1>
          <BlogList initialPosts={initialPosts || []} />
        </div>
      </Layout>
    );
  } catch (error) {
    console.error('Error in Home page:', error);
    
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4 text-red-600">Error Loading Content</h1>
            <p className="text-gray-600">Please check your connection and try again.</p>
          </div>
        </div>
      </Layout>
    );
  }
}

// Revalidate every 60 seconds for ISR
export const revalidate = 60;