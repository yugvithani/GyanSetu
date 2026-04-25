import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const ProtectRoute = ({ children }) => {
  // null = checking, true = authenticated, false = not authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkUserAuthentication = async () => {
      try {
        const userResponse = await axios.get(`${VITE_BASE_URL}/user/getId`);

        if (!userResponse || !userResponse.data) {
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkUserAuthentication();
  }, []);

  // Still checking — show a minimal full-page spinner
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-600 font-medium text-sm">Loading GyanSetu...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectRoute;
