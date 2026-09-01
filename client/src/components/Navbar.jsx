import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useInvitationStore from '../store/invitationStore';
import useProjectStore from '../store/projectStore';
import useListStore from '../store/listStore';
import useTaskStore from '../store/taskStore';
import useThemeStore from '../store/themeStore';
import { logoutApi } from '../api/auth.api';
import ConfirmDialog from './ConfirmDialog';
import { PlusSignCircleIcon, Search01Icon, Notification01Icon, CheckmarkBadge01Icon, Cancel01Icon, Sun01Icon, Moon01Icon, ComputerIcon } from 'hugeicons-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/components/ui/item"

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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { myInvitations, fetchMyInvitations, respondToInvitation, setupSocketListeners, teardownSocketListeners } = useInvitationStore();
  const { projects, currentProject, fetchProjects } = useProjectStore();
  const { lists } = useListStore();
  const { tasksByListId } = useTaskStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isProjectView = location.pathname.startsWith('/projects/') && location.pathname !== '/projects/new';
  const showProjectDetails = currentProject && isProjectView;
  
  const matchTask = location.pathname.match(/\/projects\/[^/]+\/tasks\/([^/]+)/);
  const taskId = matchTask ? matchTask[1] : null;
  const isTaskView = !!taskId;

  let task = null;
  let list = null;
  if (isTaskView) {
    for (const [listId, tasks] of Object.entries(tasksByListId)) {
      const t = tasks.find(t => t.id === taskId);
      if (t) {
        task = t;
        list = lists.find(l => l.id === t.listId);
        break;
      }
    }
  }

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const setTheme = useThemeStore((state) => state.setTheme);

  useEffect(() => {
    if (user) {
      fetchMyInvitations();
      fetchProjects();
      setupSocketListeners();
      return () => {
        teardownSocketListeners();
      };
    }
  }, [user, fetchMyInvitations, fetchProjects, setupSocketListeners, teardownSocketListeners]);

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

  const handleRespond = async (invitationId, response, projectId) => {
    setProcessingId(invitationId);
    try {
      await respondToInvitation(invitationId, response);
      if (response === 'accepted') {
        navigate(`/projects/${projectId}`);
      }
    } catch (err) {
      // Error handled by store
    } finally {
      setProcessingId(null);
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
                {showProjectDetails && (
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
                {isTaskView && list && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-muted-foreground/80">{list.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
                {isTaskView && task && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="max-w-[200px] truncate" title={task.title}>{task.title}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="relative hidden md:block">
              <Search01Icon className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="h-8 w-64 pl-9 rounded-md bg-muted/50 text-sm focus-visible:bg-transparent"
              />
            </div>
            
            <Drawer swipeDirection="right">
              <DrawerTrigger render={
                <button 
                  className="relative text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center size-8"
                  title="Notifications"
                >
                  <Notification01Icon size={22} strokeWidth={2} />
                  {myInvitations.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {myInvitations.length}
                    </span>
                  )}
                </button>
              } />
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Notifications</DrawerTitle>
                  <DrawerDescription>
                    You have {myInvitations.length} pending invitations.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-4 p-4 overflow-y-auto max-h-[60vh] max-w-2xl mx-auto w-full">
                  {myInvitations.map((invitation) => (
                    <Item key={invitation.id} variant="outline">
                      <ItemContent>
                        <ItemTitle>Project Invitation</ItemTitle>
                        <ItemDescription>
                          You have been invited to join <strong>{invitation.project.name}</strong> by {invitation.invitedBy.username}.
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          disabled={processingId === invitation.id}
                          onClick={() => handleRespond(invitation.id, 'accepted', invitation.project.id)}
                          className="text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                        >
                          <CheckmarkBadge01Icon className="h-5 w-5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          disabled={processingId === invitation.id}
                          onClick={() => handleRespond(invitation.id, 'rejected', null)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Cancel01Icon className="h-5 w-5" />
                        </Button>
                      </ItemActions>
                    </Item>
                  ))}
                  {myInvitations.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No new notifications.
                    </div>
                  )}
                </div>
              </DrawerContent>
            </Drawer>

            <button 
              onClick={() => navigate('/projects/new')}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center size-8"
              title="Create Project"
            >
              <PlusSignCircleIcon size={22} strokeWidth={2} />
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
                          <Sun01Icon className="mr-2 h-4 w-4" />
                          Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('dark')}>
                          <Moon01Icon className="mr-2 h-4 w-4" />
                          Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('system')}>
                          <ComputerIcon className="mr-2 h-4 w-4" />
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
        {showProjectDetails && (
          <div className="px-6 flex items-center gap-6 mt-1">
            <Link to={`/projects/${currentProject.id}`} className={getProjectLinkClass(`/projects/${currentProject.id}`)}>
              Overview
            </Link>
            <Link to={`/projects/${currentProject.id}/calendar`} className={getProjectLinkClass(`/projects/${currentProject.id}/calendar`)}>
              Calendar
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
