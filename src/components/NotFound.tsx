import { useNavigate } from 'react-router-dom';
import { Home, Search, ArrowLeft, Compass } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  const funnyMessages = [
    "Oops! This page went on vacation without telling anyone.",
    "404: Page not found. But hey, you found this awesome error page!",
    "This page is playing hide and seek... and winning.",
    "Houston, we have a problem. This page doesn't exist!",
    "The page you're looking for is in another castle.",
    "This is not the page you're looking for. *waves hand*",
    "Error 404: Page not found. Maybe it's taking a coffee break?",
    "Congratulations! You've discovered a page that doesn't exist!",
  ];

  useEffect(() => {
    setMessage(funnyMessages[Math.floor(Math.random() * funnyMessages.length)]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-[180px] md:text-[240px] font-bold text-primary-100 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-bounce">
              <Compass className="h-24 w-24 md:h-32 md:w-32 text-primary-600" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 px-4">
          {message}
        </p>

        {/* Description */}
        <p className="text-gray-500 mb-12 max-w-md mx-auto px-4">
          The page you're trying to reach doesn't exist or has been moved to a galaxy far, far away.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium w-full sm:w-auto"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl w-full sm:w-auto"
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Home
          </button>
        </div>

        {/* Fun Animation */}
        <div className="mt-16 flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-primary-400 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>

        {/* Optional: Fun fact */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-md max-w-lg mx-auto border-l-4 border-primary-500">
          <div className="flex items-start">
            <Search className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0 mt-1" />
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Did you know?</h3>
              <p className="text-sm text-gray-600">
                The 404 error code was named after room 404 at CERN, where the World Wide Web was created. 
                Legend says that's where the central database was located... but that's actually not true! 
                It's just a standard HTTP status code.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

