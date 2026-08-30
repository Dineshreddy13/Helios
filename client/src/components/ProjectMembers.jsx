import React, { useEffect } from 'react';
import useInvitationStore from '../store/invitationStore';

const ProjectMembers = ({ projectId }) => {
  const { 
    projectMembers, 
    fetchProjectMembers, 
    isLoading,
    error,
    clearError
  } = useInvitationStore();

  useEffect(() => {
    fetchProjectMembers(projectId);
    return () => clearError();
  }, [projectId, fetchProjectMembers, clearError]);

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <div className="alert-error flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-400 hover:text-red-300">×</button>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3">Members ({projectMembers.length})</h3>
        {isLoading && projectMembers.length === 0 ? (
          <div className="text-sm text-muted-foreground">Loading members...</div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-5 gap-3">
              {projectMembers.slice(0, 10).map(member => (
                <div key={member.id} className="flex flex-col items-center gap-1" title={`${member.user.username} (${member.role})`}>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold uppercase text-primary border border-primary/20">
                    {member.user.username.substring(0, 2)}
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                    {member.user.username}
                  </span>
                </div>
              ))}
            </div>
            {projectMembers.length > 10 && (
              <button className="text-sm text-muted-foreground hover:text-foreground text-left transition-colors pt-1">
                +{projectMembers.length - 10} more members
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectMembers;
