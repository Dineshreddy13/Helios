import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useProjectStore from '../store/projectStore';
import useActivityStore from '../store/activityStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckmarkCircle02Icon, UserIcon, Tag01Icon, Edit02Icon, CircleIcon } from 'hugeicons-react';
import { formatRelativeTime } from '../utils/date';

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
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-65px)]">

        {/* Main Content Area */}
        <div className="flex-1 p-6 lg:p-8 order-1 w-full">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-10 gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Projects</h1>
                <p className="text-muted-foreground">Manage your projects here.</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => navigate('/projects/new')}>New Project</Button>
              </div>
            </div>

            {error && (
              <div className="flex justify-between items-center mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <span>{error}</span>
                <button onClick={clearError} className="hover:opacity-70 ml-4">×</button>
              </div>
            )}

            {/* Project List */}
            {isLoading && (!projects || projects.length === 0) ? (
              <div className="text-center py-12 text-muted-foreground">Loading projects...</div>
            ) : (!projects || projects.length === 0) ? (
              <div className="text-center py-16 border border-dashed border-border rounded-2xl">
                <h3 className="text-xl font-medium mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-6">Create your first project to get started.</p>
                <Button onClick={() => navigate('/projects/new')}>Create a Project</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects?.map((project) => (
                  <div
                    key={project.id}
                    className="group cursor-pointer rounded-2xl border border-border bg-card p-5 flex flex-col gap-3 hover:border-primary/40 hover:shadow-md transition-all"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      <Badge variant={project.role === 'owner' ? 'default' : 'secondary'} className="capitalize">{project.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                      {project.description || 'No description provided.'}
                    </p>
                    <div className="mt-auto pt-3 border-t border-border/50 text-xs text-muted-foreground">
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed Sidebar */}
        <div className="w-full lg:w-[300px] xl:w-[320px] shrink-0 p-6 lg:pl-0 lg:py-8 lg:pr-8 order-2">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
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
