import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAdminAuth } from '@/lib/auth';
import { 
  HomeIcon, 
  BookOpenIcon, 
  VideoIcon, 
  BanknoteIcon, 
  SettingsIcon, 
  FilesIcon, 
  UsersIcon, 
  LogOutIcon 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { admin, logoutMutation } = useAdminAuth();
  const [location] = useLocation();
  
  if (!admin) {
    return <>{children}</>;
  }
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <HomeIcon className="w-5 h-5 mr-3" /> },
    { path: '/admin/blogs', label: 'Blog Management', icon: <BookOpenIcon className="w-5 h-5 mr-3" /> },
    { path: '/admin/videos', label: 'Video Management', icon: <VideoIcon className="w-5 h-5 mr-3" /> },
    { path: '/admin/ads', label: 'Ads Management', icon: <BanknoteIcon className="w-5 h-5 mr-3" /> },
    { path: '/admin/settings', label: 'Site Settings', icon: <SettingsIcon className="w-5 h-5 mr-3" /> },
    { path: '/admin/terms', label: 'Terms & Policies', icon: <FilesIcon className="w-5 h-5 mr-3" /> },
    { path: '/admin/users', label: 'User Management', icon: <UsersIcon className="w-5 h-5 mr-3" /> },
  ];

  return (
    <div className="flex h-screen bg-neutral-100 text-neutral-800">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-4 border-b border-neutral-200">
          <h1 className="text-xl font-bold text-neutral-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
            </svg>
            Admin Panel
          </h1>
        </div>
        
        <div className="overflow-y-auto flex-1">
          <div className="p-2">
            {menuItems.map((item) => {
              const isActive = location === item.path || 
                (item.path !== '/admin/dashboard' && location.startsWith(item.path));
                
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                >
                  <a className={`flex items-center px-4 py-2 text-sm rounded mt-1 ${
                    isActive 
                      ? 'bg-primary/10 text-primary border-l-3 border-primary' 
                      : 'hover:bg-primary/5'
                  }`}>
                    {item.icon}
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center">
            <Avatar>
              <AvatarImage src={`https://ui-avatars.com/api/?name=${admin.firstName || admin.username}`} />
              <AvatarFallback>{admin.firstName?.charAt(0) || admin.username?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-800">
                {admin.firstName} {admin.lastName}
              </p>
              <p className="text-xs font-medium text-neutral-500">{admin.email}</p>
            </div>
          </div>
          <Button 
            className="mt-3 w-full"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOutIcon className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-neutral-50">{children}</div>
    </div>
  );
}
