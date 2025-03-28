import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../config';

const ProtectRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const checkUserAuthentication = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const userResponse = await axios.get(`${BASE_URL}/user/getId`, {
          headers: { authorization: `Bearer ${token}` },
        });

        if (!userResponse || !userResponse.data) {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkUserAuthentication();
  }, []);

 
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectRoute;
