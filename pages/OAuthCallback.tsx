
import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserRole, User } from '../types';
import { Loader2 } from 'lucide-react';

const OAuthCallback: React.FC = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = () => {
      try {
        // 1. Try to get data from main URL search params (before the hash)
        const mainSearchParams = new URLSearchParams(window.location.search);
        let dataStr = mainSearchParams.get('data');

        // 2. If not found, try to get it from the hash part (after the hash)
        if (!dataStr) {
          const hash = window.location.hash;
          const hashSearchIndex = hash.indexOf('?');
          if (hashSearchIndex !== -1) {
            const hashSearchParams = new URLSearchParams(hash.substring(hashSearchIndex));
            dataStr = hashSearchParams.get('data');
          }
        }

        if (!dataStr) {
          console.error('No data found in URL or hash');
          navigate('/login');
          return;
        }

        const response = JSON.parse(dataStr);
        
        // Handle both flat and nested structures
        // If it's the nested structure { status: true, data: { ... } }
        const rawData = (response.status && response.data) ? response.data : response;
        
        // The user mentioned access and refresh tokens, but the sample shows 'token'
        // We'll prioritize 'token' then 'accessToken'
        const token = rawData.token || rawData.accessToken || rawData.access_token;
        
        if (!token) {
          console.error('No token found in data', rawData);
          navigate('/login');
          return;
        }

        // Determine role - handle 'super_admin' or other variations
        const rawRole = rawData.role?.toLowerCase();
        const role = (rawRole === 'admin' || rawRole === 'super_admin') 
          ? UserRole.ADMIN 
          : UserRole.STUDENT;

        const user: User = {
          id: rawData.id || rawData.tmaUserId,
          fullName: rawData.fullName || rawData.fullname || rawData.shortName,
          hemisId: rawData.hemisId,
          phoneNumber: rawData.phoneNumber,
          facultetId: rawData.facultetId,
          course: rawData.course,
          role: role,
          isActive: rawData.isActive !== undefined ? rawData.isActive : true,
          createdAt: rawData.createdAt
        };

        login(user, token);
        
        // If there's a refresh token, we could store it too
        if (rawData.refreshToken) {
          localStorage.setItem('refreshToken', rawData.refreshToken);
        }

        // Navigate to the appropriate dashboard
        navigate(role === UserRole.ADMIN ? '/admin' : '/student');
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [login, navigate]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest animate-pulse">
          Sessiya yuklanmoqda...
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;
