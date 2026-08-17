import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useProjectStore from '../store/projectStore';
import useActivityStore from '../store/activityStore';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Navbar from '../components/Navbar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
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
          <span className="font-semibold text-white">{actorName}</span>
          {rest}
        </>
      );
    }
    return activity.message;
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-65px)] bg-[var(--bg-color)]">
        
        {/* Main Content Area */}
        <div className="flex-1 p-6 lg:p-8 order-1 w-full">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-10 gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Projects</h1>
                <p className="text-gray-400">Manage your projects here.</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => navigate('/projects/new')}>New Project</Button>
              </div>
            </div>

            {error && (
              <div className="alert-error flex justify-between items-center mb-6">
                <span>{error}</span>
                <button onClick={clearError} className="text-red-400 hover:text-red-300">×</button>
              </div>
            )}

            {/* Project List */}
            {isLoading && projects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Loading projects...</div>
            ) : projects.length === 0 ? (
              <Card className="text-center py-16 border-dashed border-gray-800">
                <CardContent>
                  <h3 className="text-xl font-medium text-white mb-2">No projects yet</h3>
                  <p className="text-gray-400 mb-6">Create your first project to get started.</p>
                  <Button onClick={() => navigate('/projects/new')}>Create a Project</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <Card 
                    key={project.id} 
                    className="cursor-pointer hover:border-gray-600 transition-colors flex flex-col group"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <CardHeader className="mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg group-hover:text-[var(--primary-color)] transition-colors line-clamp-1">
                          {project.name}
                        </CardTitle>
                        <Badge variant={project.role}>
                          {project.role}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                        {project.description || 'No description provided.'}
                      </CardDescription>
                    </CardHeader>
                    <div className="mt-auto pt-4 border-t border-gray-800/50 text-xs text-gray-500">
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed Sidebar */}
        <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 border-t lg:border-t-0 lg:border-l border-gray-800 bg-[#050505] order-2 lg:min-h-[calc(100vh-65px)]">
          <div className="sticky top-[65px] h-auto lg:h-[calc(100vh-65px)] flex flex-col">
            <div className="p-5 lg:p-6 pb-2 border-b lg:border-none border-gray-800">
              <h2 className="text-lg font-bold tracking-tight">Recent Activity</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2 lg:p-4 pt-0 scrollbar-hide">
              {isActivityLoading && dashboardActivity.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm flex justify-center items-center h-24">
                  <div className="spinner border-t-gray-500 border-2 w-5 h-5 rounded-full animate-spin"></div>
                </div>
              ) : dashboardActivity.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">No recent activity</div>
              ) : (
                <div className="divide-y divide-gray-800/50">
                  {dashboardActivity.map((activity) => (
                    <div key={activity.id} className="p-3 lg:p-4 hover:bg-gray-800/30 transition-colors rounded-md">
                      <p className="text-sm text-gray-300 leading-snug">
                        {renderActivityMessage(activity)}
                      </p>
                      <div className="flex items-center justify-between mt-2 text-[11px] text-gray-500 font-medium uppercase tracking-wider">
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
