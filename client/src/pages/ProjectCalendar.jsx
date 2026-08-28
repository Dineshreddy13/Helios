import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import useProjectStore from '../store/projectStore';
import useListStore from '../store/listStore';
import useTaskStore from '../store/taskStore';
import Navbar from '../components/Navbar';
import Badge from '../components/Badge';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'done':
      return 'bg-green-500 border-green-600 text-white';
    case 'in-progress':
    case 'doing':
    case 'in progress':
      return 'bg-blue-500 border-blue-600 text-white';
    case 'pending':
    case 'todo':
    default:
      return 'bg-amber-500 border-amber-600 text-white';
  }
};

const ProjectCalendar = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, isLoading, error, fetchProjectById, clearError } = useProjectStore();
  const { fetchLists, setupSocketListeners, teardownSocketListeners } = useListStore();
  const { tasksByListId, fetchTasks, setupSocketListeners: setupTaskSockets, teardownSocketListeners: teardownTaskSockets } = useTaskStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (newView) => {
    setCurrentView(newView);
  };

  useEffect(() => {
    fetchProjectById(projectId);
    fetchLists(projectId).then(() => {
      setupSocketListeners(projectId);
    });
    fetchTasks(projectId).then(() => {
      setupTaskSockets(projectId);
    });

    return () => {
      clearError();
      teardownSocketListeners(projectId);
      teardownTaskSockets(projectId);
    };
  }, [projectId, fetchProjectById, clearError, fetchLists, setupSocketListeners, teardownSocketListeners, fetchTasks, setupTaskSockets, teardownTaskSockets]);

  const { scheduledTasks, unscheduledTasks } = useMemo(() => {
    const scheduled = [];
    const unscheduled = [];

    Object.values(tasksByListId).forEach(tasks => {
      tasks.forEach(task => {
        if (task.dueDate) {
          scheduled.push({
            ...task,
            start: new Date(task.dueDate),
            end: new Date(task.dueDate), // single day event for now unless we add start date
          });
        } else {
          unscheduled.push(task);
        }
      });
    });

    return { scheduledTasks: scheduled, unscheduledTasks: unscheduled };
  }, [tasksByListId]);

  if (isLoading && !currentProject) {
    return (
      <div className="page-container justify-start pt-8">
        <div className="w-full max-w-7xl text-center text-muted-foreground py-12">
          Loading calendar...
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return null;
  }

  const handleSelectEvent = (event) => {
    navigate(`/projects/${projectId}/tasks/${event.id}`);
  };

  const eventPropGetter = (event) => {
    return {
      className: `!rounded-md border bg-card hover:border-primary/50 text-card-foreground shadow-sm transition-colors !p-0 overflow-hidden`,
      style: {
        backgroundColor: undefined,
        borderColor: undefined,
      }
    };
  };

  const CustomEvent = ({ event }) => {
    return (
      <div className="flex flex-col p-1.5 h-full gap-1 justify-between">
        <div className="font-medium text-xs leading-tight line-clamp-2" title={event.title}>
          {event.title}
        </div>
        <div className="flex items-center">
          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm ${getStatusColor(event.status)}`}>
             {event.status}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-col px-4 sm:px-6 pt-8 pb-12 min-h-[calc(100vh-65px)] w-full max-w-[1600px] mx-auto">


        {error && (
          <div className="alert-error flex justify-between items-center mb-8">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-400 hover:text-red-300">×</button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 h-[700px]">
          {/* Unscheduled Tasks Sidebar */}
          <div className="xl:col-span-1 flex flex-col h-full">
            <div className="bg-card rounded-xl border shadow-sm flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b bg-muted/30">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  Unscheduled Tasks
                  <span className="bg-muted text-muted-foreground text-xs py-0.5 px-2 rounded-full">
                    {unscheduledTasks.length}
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Tasks without a due date</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {unscheduledTasks.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No unscheduled tasks found.
                  </div>
                ) : (
                  unscheduledTasks.map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
                      className="p-3 rounded-lg border bg-background hover:border-primary/50 cursor-pointer transition-colors group flex flex-col gap-2 shadow-sm"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
                          {task.title}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusColor(task.status)} bg-opacity-15 text-opacity-90`}>
                           {task.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Calendar Area */}
          <div className="xl:col-span-3 bg-card rounded-xl border shadow-sm p-4 h-full flex flex-col">
            <Calendar
              localizer={localizer}
              events={scheduledTasks}
              startAccessor="start"
              endAccessor="end"
              titleAccessor="title"
              style={{ flex: 1 }}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventPropGetter}
              views={['month', 'week', 'day']}
              className="helios-calendar"
              date={currentDate}
              onNavigate={handleNavigate}
              view={currentView}
              onView={handleViewChange}
              components={{
                event: CustomEvent,
              }}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectCalendar;
