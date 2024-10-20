'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

export default function Navbar({ title }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    toast.success('Successfully logged out!');
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-10 bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold text-neutral-950">
          {title}
        </h1>
        {isLoggedIn && (
          <div className="flex items-center space-x-6">
            {title !== "Quotes" && (
              <Link href="/quotes" className="text-neutral-950 hover:text-gray-700">
                Quotes
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-white cursor-pointer bg-neutral-950 font-bold py-2 px-4 rounded-[8px] transition-colors duration-300 hover:bg-neutral-900 hover:text-gray-200"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
