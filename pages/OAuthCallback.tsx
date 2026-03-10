
// OAuth Callback Handler
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
        console.log('OAuth Callback: Starting data extraction...');
        console.log('URL Search:', window.location.search);
        console.log('URL Hash:', window.location.hash);

        // 1. Try to get data from main URL search params (before the hash)
        const mainSearchParams = new URLSearchParams(window.location.search);
        let dataStr = mainSearchParams.get('data');

        // 2. If not found, try to get it from the hash part (after the hash)
        if (!dataStr) {
          const hash = window.location.hash;
          // Hash might look like #/login?data=... or #/oauth/callback?data=...
          const hashSearchIndex = hash.indexOf('?');
          if (hashSearchIndex !== -1) {
            const hashSearchParams = new URLSearchParams(hash.substring(hashSearchIndex));
            dataStr = hashSearchParams.get('data');
          }
        }

        if (!dataStr) {
          console.error('OAuth Callback: No data found in URL or hash');
          // If we're already on login, don't navigate again to avoid loops
          if (window.location.pathname !== '/login') {
            navigate('/login');
          }
          return;
        }

        console.log('OAuth Callback: Data found, parsing...');
        const response = JSON.parse(dataStr);
        console.log('OAuth Callback: Parsed response:', response);
        
        // Handle the nested structure { status: true, data: { ... } } or flat structure
        const rawData = (response.status && response.data) ? response.data : response;
        
        // Prioritize 'token' then 'accessToken'
        const token = rawData.token || rawData.accessToken || rawData.access_token;
        
        if (!token) {
          console.error('No token found in data', rawData);
          navigate('/login');
          return;
        }

        // Determine role - default to STUDENT if not specified (common for HEMIS student login)
        // In the provided JSON, role might be inside the token or missing from the object
        const rawRole = rawData.role?.toLowerCase();
        const role = (rawRole === 'admin' || rawRole === 'super_admin' || rawRole === 'superadmin') 
          ? UserRole.ADMIN 
          : UserRole.STUDENT;

        // Map all available fields from the provided JSON
        const user: User = {
          id: rawData.id || rawData.tmaUserId || rawData.hemisId,
          fullName: rawData.fullname || rawData.fullName || rawData.shortName || 'Foydalanuvchi',
          hemisId: rawData.hemisId,
          phoneNumber: rawData.phoneNumber,
          facultetId: rawData.facultetId,
          course: rawData.course,
          role: role,
          isActive: rawData.isActive !== undefined ? rawData.isActive : true,
          createdAt: rawData.createdAt,
          email: rawData.email,
          image: rawData.image,
          birthDate: rawData.birthDate,
          address: rawData.address,
          avgGpa: rawData.avgGpa,
          specialty: rawData.specialty,
          groupId: rawData.groupId,
          department: rawData.department,
          level: rawData.level,
          studentStatus: rawData.studentStatus,
          tmaUserId: rawData.tmaUserId
        };

        // This will save 'user' and 'token' to localStorage via AuthContext
        login(user, token);
        
        // Navigate to the appropriate dashboard
        // User explicitly asked to redirect to student page
        if (role === UserRole.STUDENT) {
          navigate('/student');
        } else {
          navigate('/admin');
        }
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
