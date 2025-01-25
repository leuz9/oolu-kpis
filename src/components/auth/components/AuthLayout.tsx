import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  linkText: string;
  linkTo: string;
}

export default function AuthLayout({ children, title, subtitle, linkText, linkTo }: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://cdn.pixabay.com/video/2023/06/25/168801-839864542_large.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Content */}
      <div className="relative z-20">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <img 
              src="https://ignite-power.com/wp-content/uploads/2024/03/ignite-logo.png" 
              alt="Ignite Power" 
              className="h-12 w-12 object-contain bg-white rounded-xl p-2"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-200">
            {subtitle}{' '}
            <Link to={linkTo} className="font-medium text-white hover:text-primary-200 transition-colors">
              {linkText}
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/10 backdrop-blur-lg py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10 border border-white/20">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}