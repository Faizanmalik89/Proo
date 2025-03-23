import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { LogOut, Menu, X } from 'lucide-react';

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const menuItems = [
    { path: '/', label: 'Home' },
    { path: '/videos', label: 'Videos' },
    { path: '/blog', label: 'Blog' },
    { path: '/about', label: 'About' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <a className="flex-shrink-0 flex items-center">
                  <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-2 text-xl font-bold text-neutral-900">MediaHub</span>
                </a>
              </Link>
              <nav className="hidden md:ml-6 md:flex md:space-x-8">
                {menuItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <a className={`${
                      location === item.path
                        ? 'border-primary text-neutral-900'
                        : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                      {item.label}
                    </a>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-neutral-700 hidden md:inline-block">
                      {user.firstName || user.username}
                    </span>
                    <div className="relative">
                      <div className="flex items-center">
                        <Avatar>
                          <AvatarImage src={`https://ui-avatars.com/api/?name=${user.firstName || user.username}`} />
                          <AvatarFallback>{user.firstName?.charAt(0) || user.username?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-2 hidden md:inline-flex">
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href="/auth">
                    <Button>
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"></path>
                      </svg>
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
              
              {/* Mobile menu button */}
              <div className="flex items-center md:hidden ml-4">
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                >
                  <span className="sr-only">Open main menu</span>
                  {mobileMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a 
                  className={`${
                    location === item.path
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-transparent text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-800'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              </Link>
            ))}
            {user && (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="border-transparent text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-neutral-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <div className="flex items-center">
                <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-2 text-xl font-bold text-white">MediaHub</span>
              </div>
              <p className="text-neutral-300 text-base">
                Your one-stop platform for videos, blogs, and digital content to help you learn, grow, and stay informed.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-neutral-400 hover:text-neutral-300">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-neutral-400 hover:text-neutral-300">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-neutral-400 hover:text-neutral-300">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-neutral-400 hover:text-neutral-300">
                  <span className="sr-only">YouTube</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-300 tracking-wider uppercase">
                    Content
                  </h3>
                  <ul role="list" className="mt-4 space-y-4">
                    <li>
                      <Link href="/videos">
                        <a className="text-base text-neutral-400 hover:text-neutral-300">
                          Videos
                        </a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog">
                        <a className="text-base text-neutral-400 hover:text-neutral-300">
                          Blog Posts
                        </a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/categories">
                        <a className="text-base text-neutral-400 hover:text-neutral-300">
                          Categories
                        </a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/">
                        <a className="text-base text-neutral-400 hover:text-neutral-300">
                          Featured
                        </a>
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-neutral-300 tracking-wider uppercase">
                    Support
                  </h3>
                  <ul role="list" className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-neutral-400 hover:text-neutral-300">
                        Help Center
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-neutral-400 hover:text-neutral-300">
                        Contact Us
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-neutral-400 hover:text-neutral-300">
                        FAQs
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-neutral-400 hover:text-neutral-300">
                        Sitemap
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-300 tracking-wider uppercase">
                    Company
                  </h3>
                  <ul role="list" className="mt-4 space-y-4">
                    <li>
                      <Link href="/about">
                        <a className="text-base text-neutral-400 hover:text-neutral-300">
                          About
                        </a>
                      </Link>
                    </li>
                    <li>
                      <a href="#" className="text-base text-neutral-400 hover:text-neutral-300">
                        Careers
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-neutral-400 hover:text-neutral-300">
                        Partners
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-neutral-400 hover:text-neutral-300">
                        Press
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-neutral-300 tracking-wider uppercase">
                    Legal
                  </h3>
                  <ul role="list" className="mt-4 space-y-4">
                    <li>
                      <Link href="/terms">
                        <a className="text-base text-neutral-400 hover:text-neutral-300">
                          Privacy Policy
                        </a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms">
                        <a className="text-base text-neutral-400 hover:text-neutral-300">
                          Terms of Service
                        </a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms">
                        <a className="text-base text-neutral-400 hover:text-neutral-300">
                          Cookie Policy
                        </a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms">
                        <a className="text-base text-neutral-400 hover:text-neutral-300">
                          Copyright Information
                        </a>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-neutral-700 pt-8">
            <p className="text-base text-neutral-400 text-center">
              &copy; {new Date().getFullYear()} MediaHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
