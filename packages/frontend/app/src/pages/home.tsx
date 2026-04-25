import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/chats');
  }, [navigate]);

  return null;
};
