import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useProjectStore from '../store/projectStore';
import useActivityStore from '../store/activityStore';
import Navbar from '../components/Navbar';
import Badge from '../components/Badge';
import { Button } from '@/components/ui/button';
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

  return (
    <>
      <Navbar />
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
                      <Badge variant={project.role}>{project.role}</Badge>
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
        <div className="w-full lg:w-[300px] xl:w-[340px] shrink-0 border-t lg:border-t-0 lg:border-l border-border order-2 lg:min-h-[calc(100vh-65px)]">
          <div className="sticky top-[65px] h-auto lg:h-[calc(100vh-65px)] flex flex-col">
            <div className="p-5 lg:p-6 pb-2 border-b border-border">
              <h2 className="text-base font-semibold tracking-tight">Recent Activity</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2 lg:p-3">
              {isActivityLoading && (!dashboardActivity || dashboardActivity.length === 0) ? (
                <div className="p-6 text-center text-muted-foreground text-sm flex justify-center items-center h-24">
                  <div className="w-5 h-5 rounded-full border-2 border-border border-t-foreground animate-spin"></div>
                </div>
              ) : (!dashboardActivity || dashboardActivity.length === 0) ? (
                <div className="p-6 text-center text-muted-foreground text-sm">No recent activity</div>
              ) : (
                <div className="divide-y divide-border/50">
                  {dashboardActivity?.map((activity) => (
                    <div key={activity.id} className="p-3 hover:bg-muted/50 transition-colors rounded-xl">
                      <p className="text-sm text-muted-foreground leading-snug">
                        {renderActivityMessage(activity)}
                      </p>
                      <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wider">
                        <span className="truncate max-w-[120px]">{activity.project?.name}</span>
                        <span>{formatRelativeTime(activity.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;
