import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight01Icon, File02Icon, Cancel01Icon, CheckmarkCircle02Icon, CircleIcon, Upload01Icon, Calendar01Icon, Tag01Icon, UserIcon, File01Icon, Notification01Icon, ArrowDown01Icon } from 'hugeicons-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ConfirmDialog from '../components/ConfirmDialog';
import useProjectStore from '../store/projectStore';
import useListStore from '../store/listStore';
import useTaskStore from '../store/taskStore';
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Spinner } from "@/components/ui/spinner";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

const TaskDescriptionEditor = ({ task, updateTask }) => {
  const [descInput, setDescInput] = useState(task?.description || '');
  const [isDescDirty, setIsDescDirty] = useState(false);

  useEffect(() => {
    if (task && !isDescDirty) {
      setDescInput(task.description || '');
    }
  }, [task?.description, isDescDirty]);

  const handleSaveDescription = async () => {
    try {
      await updateTask(task.id, { description: descInput.trim() });
      setIsDescDirty(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 flex-1">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Description</h2>
        {isDescDirty && (
          <Button size="sm" onClick={handleSaveDescription}>
            Save changes
          </Button>
        )}
      </div>
      <Textarea
        value={descInput}
        onChange={(e) => {
          setDescInput(e.target.value);
          setIsDescDirty(true);
        }}
        placeholder="Add a more detailed description..."
        className="min-h-[250px] resize-y bg-card/50"
      />
    </div>
  );
};

const TaskPage = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();

  const { currentProject, fetchProjectById } = useProjectStore();
  const { lists, fetchLists, setupSocketListeners: setupListSockets, teardownSocketListeners: teardownListSockets } = useListStore();
  const { tasksByListId, fetchTasks, updateTask, uploadTaskFiles, deleteTaskFile, setupSocketListeners: setupTaskSockets, teardownSocketListeners: teardownTaskSockets } = useTaskStore();

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [isDeletingFile, setIsDeletingFile] = useState(false);
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [reminderDate, setReminderDate] = useState(undefined);
  const [reminderTime, setReminderTime] = useState("10:30");
  const [openDatePopover, setOpenDatePopover] = useState(false);
  const [openReminder, setOpenReminder] = useState(false);
  const [isSavingReminder, setIsSavingReminder] = useState(false);

  useEffect(() => {
    fetchProjectById(projectId);

    fetchLists(projectId).then(() => {
      setupListSockets(projectId);
    });

    fetchTasks(projectId).then(() => {
      setupTaskSockets(projectId);
    });

    return () => {
      teardownListSockets(projectId);
      teardownTaskSockets(projectId);
    };
  }, [projectId, fetchProjectById, fetchLists, setupListSockets, teardownListSockets, fetchTasks, setupTaskSockets, teardownTaskSockets]);

  // Find the task and its parent list
  const { task, list } = useMemo(() => {
    let foundTask = null;
    let foundList = null;

    for (const [listId, tasks] of Object.entries(tasksByListId)) {
      const t = tasks.find((t) => t.id === taskId);
      if (t) {
        foundTask = t;
        foundList = lists.find((l) => l.id === t.listId) || { name: 'Unknown List' };
        break;
      }
    }

    return { task: foundTask, list: foundList };
  }, [tasksByListId, lists, taskId]);

  useEffect(() => {
    if (task) {
      if (task.reminderAt) {
        const d = new Date(task.reminderAt);
        setReminderDate(d);
        setReminderTime(d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
      } else {
        setReminderDate(undefined);
        setReminderTime("10:30");
      }
    }
  }, [task?.reminderAt, openReminder]);

  const confirmToggleStatus = async () => {
    if (!task) return;
    setIsUpdatingStatus(true);
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await updateTask(task.id, { status: newStatus });
    } finally {
      setIsUpdatingStatus(false);
      setShowConfirmComplete(false);
    }
  };

  const handleStatusClick = () => {
    if (task?.status !== 'completed') {
      setShowConfirmComplete(true);
    } else {
      confirmToggleStatus();
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      await uploadTaskFiles(task.id, files);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteFile = (fileId) => {
    setFileToDelete(fileId);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsDeletingFile(true);
    try {
      await deleteTaskFile(task.id, fileToDelete);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingFile(false);
      setFileToDelete(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSaveReminder = async () => {
    setIsSavingReminder(true);
    try {
      let finalIso = null;
      if (reminderDate) {
        const [hours, minutes, seconds] = reminderTime.split(':');
        const newDate = new Date(reminderDate);
        newDate.setHours(parseInt(hours || 0, 10));
        newDate.setMinutes(parseInt(minutes || 0, 10));
        newDate.setSeconds(parseInt(seconds || 0, 10));
        finalIso = newDate.toISOString();
      }

      await updateTask(task.id, {
        reminderAt: finalIso,
      });
      setOpenReminder(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingReminder(false);
    }
  };

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  if (!task) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] w-full text-muted-foreground">
          <Spinner className="w-8 h-8 mb-4" />
          <p>Loading task...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center px-4 sm:px-6 justify-start pt-8 pb-12 min-h-[calc(100vh-65px)] w-full">
        <div className="w-full max-w-4xl space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>

              {/* Assignee & Tags */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4" />
                  <span className="font-medium text-foreground">{task.assignee ? task.assignee.username : 'Unassigned'}</span>
                </div>

                {task.tags && task.tags.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Tag01Icon className="w-4 h-4" />
                    <div className="flex flex-wrap gap-1.5">
                      {task.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/25">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Dialog open={openReminder} onOpenChange={setOpenReminder}>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium hover:bg-muted transition-colors border border-transparent hover:border-border">
                      <Notification01Icon className={cn("w-4 h-4", task.reminderAt ? "text-orange-500" : "text-muted-foreground")} />
                      <span className={cn("font-medium", task.reminderAt ? "text-foreground" : "text-muted-foreground")}>
                        {task.reminderAt ? `Reminder: ${format(new Date(task.reminderAt), "PP p")}` : 'Set Reminder'}
                      </span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Set Reminder</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 flex flex-col items-center">
                      <FieldGroup className="flex flex-row gap-4 w-full justify-center items-end">
                        <Field>
                          <FieldLabel htmlFor="date-picker-optional">Date</FieldLabel>
                          <Popover open={openDatePopover} onOpenChange={setOpenDatePopover}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" id="date-picker-optional" className="w-[200px] justify-between font-normal">
                                {reminderDate ? format(reminderDate, "PPP") : "Select date"}
                                <ArrowDown01Icon className="ml-2 h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={reminderDate}
                                captionLayout="dropdown"
                                defaultMonth={reminderDate}
                                onSelect={(date) => {
                                  setReminderDate(date);
                                  setOpenDatePopover(false);
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </Field>
                        <Field className="w-32">
                          <FieldLabel htmlFor="time-picker-optional">Time</FieldLabel>
                          <Input
                            type="time"
                            id="time-picker-optional"
                            value={reminderTime}
                            onChange={(e) => setReminderTime(e.target.value)}
                            className="font-normal text-foreground appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          />
                        </Field>
                      </FieldGroup>
                    </div>

                    <DialogFooter className="flex justify-between items-center sm:justify-between w-full pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReminderDate(undefined);
                          setReminderTime("10:30");
                        }}
                        disabled={isSavingReminder || !reminderDate}
                      >
                        Clear
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setOpenReminder(false)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveReminder} disabled={isSavingReminder}>
                          {isSavingReminder ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Button
              variant={task.status === 'completed' ? 'outline' : 'default'}
              className="shrink-0"
              onClick={handleStatusClick}
            >
              {task.status === 'completed' ? (
                <>
                  <CheckmarkCircle02Icon className="w-4 h-4 mr-2 text-green-500" />
                  Completed
                </>
              ) : (
                <>
                  <CircleIcon className="w-4 h-4 mr-2" />
                  Mark as Complete
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-8 justify-between">
            {/* Description Section */}
            <TaskDescriptionEditor task={task} updateTask={updateTask} />

            {/* Calendar Section */}
            <div className="space-y-4 flex-none md:flex md:flex-col md:items-end">
              <h2 className="text-xl font-semibold w-full text-left md:text-right">Timeline</h2>
              <Card className="w-full md:w-fit p-0 bg-card/50">
                <CardContent className="p-0 flex justify-center md:justify-end">
                  <Calendar
                    mode="range"
                    defaultMonth={new Date()}
                    selected={{
                      from: new Date(),
                      to: task.dueDate ? new Date(task.dueDate) : new Date(),
                    }}
                    numberOfMonths={1}
                    captionLayout="dropdown"
                    formatters={{
                      formatMonthDropdown: (date) => {
                        return date.toLocaleString("default", { month: "long" })
                      },
                    }}
                    components={{
                      DayButton: ({ children, modifiers, day, ...props }) => {
                        const isDeadline = task.dueDate && day.date.toDateString() === new Date(task.dueDate).toDateString();

                        return (
                          <CalendarDayButton
                            day={day}
                            modifiers={modifiers}
                            {...props}
                            className={`${props.className || ''} ${isDeadline ? '!bg-destructive !text-destructive-foreground hover:!bg-destructive/90' : ''}`}
                          >
                            {children}
                          </CalendarDayButton>
                        )
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Files Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Attachments</h2>
              <div>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  disabled={isUploading || (task.files?.length >= 5)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUploading || (task.files?.length >= 5)}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload01Icon className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            </div>

            {task.files && task.files.length >= 5 && (
              <p className="text-xs text-amber-500">Maximum file limit (5) reached.</p>
            )}

            <div className="flex flex-col gap-3 py-4">
              {task.files?.filter(f => f.mimeType.startsWith('image/')).length > 0 && (
                <AttachmentGroup>
                  {task.files.filter(f => f.mimeType.startsWith('image/')).map((file) => {
                    const fileUrl = `${apiUrl}${file.url}`;

                    return (
                      <Attachment key={file.id} orientation="vertical">
                        <AttachmentMedia variant="image">
                          <img src={fileUrl} alt={file.name} className="object-cover w-full h-full" />
                        </AttachmentMedia>
                        <AttachmentContent>
                          <AttachmentTitle>{file.name}</AttachmentTitle>
                          <AttachmentDescription>
                            {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'} · {formatFileSize(file.size)}
                          </AttachmentDescription>
                        </AttachmentContent>
                        <AttachmentActions>
                          <AttachmentAction aria-label="Remove attachment" onClick={() => handleDeleteFile(file.id)}>
                            <Cancel01Icon className="w-4 h-4" />
                          </AttachmentAction>
                        </AttachmentActions>
                      </Attachment>
                    );
                  })}
                </AttachmentGroup>
              )}

              {task.files?.filter(f => !f.mimeType.startsWith('image/')).map((file) => (
                <Attachment key={file.id} className="w-full sm:max-w-md">
                  <AttachmentMedia>
                    <File02Icon className="w-5 h-5 text-muted-foreground" />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>{file.name}</AttachmentTitle>
                    <AttachmentDescription>
                      {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'} · {formatFileSize(file.size)}
                    </AttachmentDescription>
                  </AttachmentContent>
                  <AttachmentActions>
                    <AttachmentAction aria-label="Remove attachment" onClick={() => handleDeleteFile(file.id)}>
                      <Cancel01Icon className="w-4 h-4" />
                    </AttachmentAction>
                  </AttachmentActions>
                </Attachment>
              ))}

              {isUploading && (
                <Attachment className="w-full sm:max-w-md">
                  <AttachmentMedia>
                    <Spinner className="text-primary w-5 h-5" />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>Uploading file(s)...</AttachmentTitle>
                    <AttachmentDescription>Please wait</AttachmentDescription>
                  </AttachmentContent>
                </Attachment>
              )}

              {(!task.files || task.files.length === 0) && !isUploading && (
                <div className="text-center py-12 border border-dashed rounded-xl text-muted-foreground bg-muted/20">
                  <File01Icon className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No attachments yet.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <ConfirmDialog
        isOpen={!!fileToDelete}
        title="Delete Attachment"
        description="Are you sure you want to permanently delete this attachment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeletingFile}
        onConfirm={confirmDeleteFile}
        onCancel={() => setFileToDelete(null)}
      />

      <ConfirmDialog
        isOpen={showConfirmComplete}
        title="Mark Task as Complete"
        description="Are you sure you want to mark this task as complete?"
        confirmText="Complete Task"
        cancelText="Cancel"
        isLoading={isUpdatingStatus}
        onConfirm={confirmToggleStatus}
        onCancel={() => setShowConfirmComplete(false)}
      />
    </>
  );
};

export default TaskPage;
