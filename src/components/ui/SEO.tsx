import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  canonicalOverride?: string;
  schema?: Record<string, any>;
}

export default function SEO({
  title,
  description,
  keywords,
  image,
  type = 'website',
  canonicalOverride,
  schema
}: SEOProps) {
  const location = useLocation();

  const siteTitle = 'Bitcoin Education Platform';
  const defaultDesc =
    'Interactive learning curriculum based on the Bitcoin Diploma, with real-time AI-powered instructor feedback and quizzes to track student mastery.';
  const defaultKeywords = 'Bitcoin Education, Bitcoin Diploma, Learn Bitcoin, Satoshi, Cryptography, Sound Money, Financial Literacy, African Bitcoin Pioneer, SATs rewards';
  const defaultImage = 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=600'; // Sleek gold bar/coins

  const currentUrl = canonicalOverride || window.location.origin + location.pathname;
  const displayTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} - Interactive Bitcoin Diploma`;
  const displayDesc = description || defaultDesc;
  const displayKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;
  const displayImage = image || defaultImage;

  useEffect(() => {
    // 1. Title
    document.title = displayTitle;

    // Helper for Meta Tags
    const setMetaTag = (attribute: 'name' | 'property', key: string, val: string) => {
      let element = document.querySelector(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', val);
    };

    // Helper for Link Tags
    const setLinkTag = (rel: string, val: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', val);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', displayDesc);
    setMetaTag('name', 'keywords', displayKeywords);
    setMetaTag('name', 'author', 'Bitcoin Africa Story');

    // 3. Open Graph (Facebook / LinkedIn)
    setMetaTag('property', 'og:title', displayTitle);
    setMetaTag('property', 'og:description', displayDesc);
    setMetaTag('property', 'og:image', displayImage);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', siteTitle);

    // 4. Twitter Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', displayTitle);
    setMetaTag('name', 'twitter:description', displayDesc);
    setMetaTag('name', 'twitter:image', displayImage);

    // 5. Canonical Link
    setLinkTag('canonical', currentUrl);

    // 6. Schema.org JSON-LD Structured Data Injection
    let schemaScript = document.getElementById('seo-structured-data') as HTMLScriptElement | null;
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'seo-structured-data';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        ...schema
      });
    } else {
      // Create a default educational platform schema if none is custom-provided
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'seo-structured-data';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        'name': siteTitle,
        'description': defaultDesc,
        'url': window.location.origin,
        'logo': defaultImage,
        'sameAs': [
          'https://twitter.com/BitcoinEdu',
          'https://github.com/BitcoinEdu'
        ]
      });
    }

    return () => {
      // Optional cleanup of page-specific schema if needed, but keeping it simple
    };
  }, [displayTitle, displayDesc, displayKeywords, displayImage, currentUrl, type, schema]);

  return null;
}
