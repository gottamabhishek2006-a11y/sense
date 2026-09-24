import { useAuthContext } from '../context/AuthContext';

/**
 * Custom hook to access authentication state and methods
 */
export const useAuth = () => {
  return useAuthContext();
};

export default useAuth;
