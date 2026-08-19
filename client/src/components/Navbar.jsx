import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useInvitationStore from '../store/invitationStore';
import useProjectStore from '../store/projectStore';
import useThemeStore from '../store/themeStore';
import { logoutApi } from '../api/auth.api';
import ConfirmDialog from './ConfirmDialog';
import { CirclePlus, Search } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Sun, Moon, Monitor } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { myInvitations, fetchMyInvitations } = useInvitationStore();
  const { projects, currentProject, fetchProjects } = useProjectStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const setTheme = useThemeStore((state) => state.setTheme);

  useEffect(() => {
    if (user) {
      fetchMyInvitations();
      fetchProjects();
    }
  }, [user, fetchMyInvitations, fetchProjects]);

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

  const isActive = (path) => {
    // Exact match for the project links
    if (location.pathname === path) return true;
    
    // For Dashboard vs Project context
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;

    return false;
  };

  const getProjectLinkClass = (path) => {
    return `relative flex items-center px-1 pb-2 pt-1 text-sm font-medium transition-colors border-b-2 ${
      isActive(path)
        ? 'border-primary text-foreground'
        : 'border-transparent text-muted-foreground hover:text-foreground'
    }`;
  };

  return (
    <>
      <nav className="w-full border-b border-border bg-background flex flex-col sticky top-0 z-40">
        {/* Top Row */}
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-xl font-bold tracking-tight text-foreground hidden sm:block">
              Helios
            </Link>
            
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link to="/dashboard">{user?.username}</Link>} />
                </BreadcrumbItem>
                {currentProject && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <button className="flex items-center gap-1 font-semibold text-foreground hover:bg-muted px-2 py-1 rounded-md transition-colors">
                            {currentProject.name}
                            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
                          </button>
                        } />
                        <DropdownMenuContent align="start" className="w-56">
                          <DropdownMenuGroup>
                            {projects.map((project) => (
                              <DropdownMenuItem key={project.id} onClick={() => navigate(`/projects/${project.id}`)}>
                                {project.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="h-8 w-64 pl-9 rounded-md bg-muted/50 text-sm focus-visible:bg-transparent"
              />
            </div>
            
            <button 
              onClick={() => navigate('/projects/new')}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
              title="Create Project"
            >
              <CirclePlus size={22} strokeWidth={2} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" size="icon" className="rounded-full overflow-hidden border border-border hover:border-muted-foreground transition-colors size-8">
                  <Avatar className="size-full">
                    <AvatarFallback className="bg-muted text-muted-foreground font-medium uppercase text-sm">
                      {user?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2 border-b border-border mb-1">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="text-sm font-medium text-foreground truncate">{user?.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      Theme
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => setTheme('light')}>
                          <Sun className="mr-2 h-4 w-4" />
                          Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('dark')}>
                          <Moon className="mr-2 h-4 w-4" />
                          Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('system')}>
                          <Monitor className="mr-2 h-4 w-4" />
                          System
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowLogoutConfirm(true)} variant="destructive">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Bottom Row (Project Specific Links) */}
        {currentProject && (
          <div className="px-6 flex items-center gap-6 mt-1">
            <Link to={`/projects/${currentProject.id}`} className={getProjectLinkClass(`/projects/${currentProject.id}`)}>
              Overview
            </Link>
            <Link to={`/projects/${currentProject.id}/invitations`} className={getProjectLinkClass(`/projects/${currentProject.id}/invitations`)}>
              Invitations
              {myInvitations.length > 0 && (
                <span className="ml-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {myInvitations.length}
                </span>
              )}
            </Link>
            <Link to={`/projects/${currentProject.id}/discuss`} className={getProjectLinkClass(`/projects/${currentProject.id}/discuss`)}>
              Discuss
            </Link>
            <Link to={`/projects/${currentProject.id}/talk`} className={getProjectLinkClass(`/projects/${currentProject.id}/talk`)}>
              Talk
            </Link>
            <Link to={`/projects/${currentProject.id}/settings`} className={getProjectLinkClass(`/projects/${currentProject.id}/settings`)}>
              Settings
            </Link>
          </div>
        )}
      </nav>

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
    </>
  );
};

export default Navbar;
