import { createContext, useContext } from "react";
import axios from "axios";

import BASE_URL from "../config";


const ActivityContext = createContext();

export const ActivityProvider = ({ children }) => {
  
  
  // Function to log an activity
  const logActivity = async (type, content) => {
    try {
      
      await axios.post(`${BASE_URL}/activities/add`, { type, content}, {
        headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
      });
  
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };
  
  
  return (
    <ActivityContext.Provider value={{ logActivity }}>
      {children}
    </ActivityContext.Provider>
  );
};

// Custom hook to use activity tracking
export const useActivity = () => useContext(ActivityContext);
