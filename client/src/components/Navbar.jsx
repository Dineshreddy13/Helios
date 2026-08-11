import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useInvitationStore from '../store/invitationStore';
import { logoutApi } from '../api/auth.api';
import { Dropdown, DropdownItem } from './Dropdown';
import ConfirmDialog from './ConfirmDialog';
import { CirclePlus } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { myInvitations, fetchMyInvitations } = useInvitationStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyInvitations();
    }
  }, [user, fetchMyInvitations]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutApi();
    } catch {}
    finally {
      logout();
      navigate('/', { replace: true });
    }
  };

  const isActive = (path) => location.pathname === path || (path === '/dashboard' && location.pathname.startsWith('/projects'));

  return (
    <nav className="w-full border-b border-[var(--border-color)] bg-[var(--bg-color)] px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-8">
        <Link to="/dashboard" className="text-xl font-bold tracking-tight">Helios</Link>
        <div className="flex items-center gap-5 text-sm">
          <Link 
            to="/dashboard" 
            className={`transition-colors hover:text-white ${isActive('/dashboard') ? 'text-white font-medium' : 'text-gray-400'}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/invitations" 
            className={`flex items-center gap-2 transition-colors hover:text-white ${isActive('/invitations') ? 'text-white font-medium' : 'text-gray-400'}`}
          >
            Invitations
            {myInvitations.length > 0 && (
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {myInvitations.length}
              </span>
            )}
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <button 
          onClick={() => navigate('/projects/new')}
          className="text-gray-400 hover:text-white transition-colors flex items-center justify-center"
          title="Create Project"
        >
          <CirclePlus size={22} strokeWidth={2} />
        </button>
        <Dropdown 
          trigger={
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-medium uppercase border border-gray-700 text-gray-300 hover:border-gray-500 transition-colors">
              {user?.username?.charAt(0) || 'U'}
            </div>
          }
        >
          <div className="px-4 py-2 border-b border-[var(--border-color)] mb-1">
            <p className="text-sm font-medium text-white truncate">{user?.username}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <DropdownItem onClick={() => navigate('/dashboard')}>
            Profile
          </DropdownItem>
          <DropdownItem onClick={() => setShowLogoutConfirm(true)} variant="destructive">
            Sign out
          </DropdownItem>
        </Dropdown>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Sign Out"
        description="Are you sure you want to sign out?"
        confirmText="Sign out"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isLoggingOut}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </nav>
  );
};

export default Navbar;
