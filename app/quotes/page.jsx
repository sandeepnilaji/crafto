"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getQuotes } from "../../lib/api";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

export default function QuoteListPage() {
  const [quotes, setQuotes] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const observer = useRef();

  const fetchQuotes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      const response = await getQuotes(20, offset, token);

      const newQuotes = Array.isArray(response)
        ? response
        : response.data || [];

      if (newQuotes.length === 0) {
        setHasMore(false);
      } else {
        setQuotes((prevQuotes) => [...prevQuotes, ...newQuotes]);
        setOffset((prevOffset) => prevOffset + newQuotes.length);
      }
    } catch (error) {
      console.error("Failed to fetch quotes:", error);
      setError("Failed to load quotes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const lastQuoteElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchQuotes();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  useEffect(() => {
    setQuotes([]);
    setOffset(0);
    setHasMore(true);
    fetchQuotes();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
       <Navbar title="Quotes" />
      <div className="flex-grow overflow-y-auto">
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-16 lg:px-20 mt-8">
          {quotes.map((quote, index) => (
            <div
              key={quote.id}
              ref={index === quotes.length - 1 ? lastQuoteElementRef : null}
              className="bg-white rounded-[24px] shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl animate-fadeIn hover:rotate-[0.2deg] cursor-pointer"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={quote.mediaUrl}
                  alt="Quote"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 transition-opacity duration-300 opacity-0 hover:opacity-100">
                  <p className="text-white text-center text-lg font-semibold transform transition-transform duration-300 hover:scale-105 capitalize">
                    {quote.text}
                  </p>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 transition-colors duration-300 hover:bg-gray-50">
                <p className="text-[16px] text-gray-600 font-medium transition-colors duration-300 hover:text-gray-800 capitalize">
                  Uploaded By {quote.username}
                </p>
                <p className="text-[12px] text-gray-500 mt-1 transition-colors duration-300 hover:text-gray-700">
                  {new Date(quote.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
        {isLoading && (
          <div className="flex justify-center items-center mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>
      <Link href="/quotes/create">
        <button className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-neutral-950 text-white flex items-center justify-center shadow-lg hover:bg-neutral-850 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-all duration-300 hover:scale-110 hover:rotate-180">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </Link>
    </div>
  );
}
