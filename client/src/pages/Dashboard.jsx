import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useProjectStore from '../store/projectStore';
import useActivityStore from '../store/activityStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckmarkCircle02Icon, UserIcon, Tag01Icon, Edit02Icon, CircleIcon, Search01Icon, TrelloIcon } from 'hugeicons-react';
import { formatRelativeTime } from '../utils/date';
import { useMemo, useState } from 'react';

const Dashboard = () => {
  const { projects, isLoading, error, fetchProjects, clearError } = useProjectStore();
  const {
    dashboardActivity,
    isLoading: isActivityLoading,
    fetchDashboardActivity,
    setupDashboardSocketListeners,
    teardownDashboardSocketListeners
  } = useActivityStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    if (!searchQuery) return projects;
    return projects.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ownerUsername?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  useEffect(() => {
    fetchProjects();
    fetchDashboardActivity();
  }, [fetchProjects, fetchDashboardActivity]);

  useEffect(() => {
    if (projects && projects.length > 0) {
      const projectIds = projects.map((p) => p.id);
      setupDashboardSocketListeners(projectIds);
      return () => {
        teardownDashboardSocketListeners(projectIds);
      };
    }
  }, [projects, setupDashboardSocketListeners, teardownDashboardSocketListeners]);

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const renderActivityMessage = (activity) => {
    const actorName = activity.actor?.username || activity.metadata?.actorName || 'Someone';
    if (activity.message.startsWith(actorName)) {
      const rest = activity.message.slice(actorName.length);
      return (
        <>
          <span className="font-semibold text-foreground">{actorName}</span>
          {rest}
        </>
      );
    }
    return activity.message;
  };

  const renderActivityIcon = (targetType) => {
    switch (targetType) {
      case 'TASK':
        return <CheckmarkCircle02Icon className="w-3.5 h-3.5 text-blue-500" />;
      case 'PROJECT':
        return <Tag01Icon className="w-3.5 h-3.5 text-purple-500" />;
      case 'MEMBER':
        return <UserIcon className="w-3.5 h-3.5 text-green-500" />;
      case 'MESSAGE':
        return <Edit02Icon className="w-3.5 h-3.5 text-orange-500" />;
      default:
        return <CircleIcon className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-65px)] w-full">

        {/* Left Sidebar - Projects List */}
        <div className="w-full lg:w-[320px] xl:w-[340px] shrink-0 border-r border-border bg-muted/10 p-4 flex flex-col gap-4 order-1">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-sm font-semibold tracking-tight">Projects</h2>
            <Button variant="default" size="sm" className="h-7 text-xs px-2.5 shadow-none flex items-center gap-1.5" onClick={() => navigate('/projects/new')}>
              <TrelloIcon className="w-3.5 h-3.5" />
              New
            </Button>
          </div>

          <div className="relative">
            <Search01Icon className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Find a project..."
              className="pl-8 h-8 text-sm bg-background shadow-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-0.5 overflow-y-auto mt-2">
            {isLoading && (!projects || projects.length === 0) ? (
              <div className="text-center py-4 text-xs text-muted-foreground">Loading projects...</div>
            ) : (!filteredProjects || filteredProjects.length === 0) ? (
              <div className="text-center py-4 text-xs text-muted-foreground">No projects found.</div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="group flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <Avatar className="w-5 h-5 rounded-md border border-border">
                    <AvatarFallback className="text-[9px] rounded-md bg-primary/10 text-primary">
                      {project.ownerUsername ? project.ownerUsername[0].toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground truncate flex-1">
                    <span className="text-muted-foreground font-normal">{project.ownerUsername || 'user'}/</span>
                    {project.name}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content Area - Placeholder */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8 order-2 w-full bg-background">
          <Label className="text-muted-foreground">
            Something better is coming here
          </Label>
        </div>

        {/* Activity Feed Sidebar */}
        <div className="w-full lg:w-[350px] xl:w-[450px] shrink-0 p-4 order-3 flex flex-col">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden max-w-[300px]">
            <div className="px-4 py-3 border-b border-border bg-muted/10">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Recent Activity</h2>
            </div>
            <div className="flex flex-col p-2">
              {isActivityLoading && (!dashboardActivity || dashboardActivity.length === 0) ? (
                <div className="p-4 text-center text-muted-foreground text-sm flex justify-center items-center h-16">
                  <div className="w-4 h-4 rounded-full border-2 border-border border-t-foreground animate-spin"></div>
                </div>
              ) : (!dashboardActivity || dashboardActivity.length === 0) ? (
                <div className="p-6 text-center text-muted-foreground text-sm">No recent activity</div>
              ) : (
                <div className="relative pl-6 space-y-5 pb-4 pt-3">
                  {/* Vertical Line */}
                  <div className="absolute top-5 bottom-6 left-[15px] w-[2px] bg-border/60" />

                  {dashboardActivity?.slice(0, 6).map((activity) => (
                    <div key={activity.id} className="relative flex items-start gap-3 z-10 group">
                      {/* Timeline Dot/Icon */}
                      <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 ml-[-20px] rounded-full bg-card border-[2px] border-border text-muted-foreground mt-0 shadow-sm group-hover:border-primary/50 transition-colors">
                        {renderActivityIcon(activity.targetType)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col mt-0.5">
                        <p className="text-sm text-foreground leading-snug">
                          {renderActivityMessage(activity)}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium mt-1">
                          <span className="truncate max-w-[120px]">{activity.project?.name}</span>
                          <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/50 mx-0.5"></span>
                          <span className="shrink-0">{formatRelativeTime(activity.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {dashboardActivity && dashboardActivity.length > 0 && (
              <div className="border-t border-border bg-muted/10 p-2.5 text-center transition-colors hover:bg-muted/30">
                <a href="#" className="text-xs font-medium text-muted-foreground hover:text-foreground">
                  View full log
                </a>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;
