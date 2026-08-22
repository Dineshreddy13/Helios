import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProjectDiscussion from '../components/ProjectDiscussion';
import useProjectStore from '../store/projectStore';

const Discuss = () => {
  const { projectId } = useParams();
  const { currentProject } = useProjectStore();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <div className="flex flex-col items-center flex-1 w-full overflow-hidden">
        <div className="w-full max-w-5xl h-full flex flex-col border-l border-r border-border/50 bg-background/50">
          <div className="px-6 py-4 border-b border-border/50 w-full flex justify-between items-center shrink-0 bg-background">
             <h1 className="text-xl font-bold tracking-tight">Discussion</h1>
             <p className="text-sm text-muted-foreground">{currentProject?.name}</p>
          </div>
          <div className="flex-1 overflow-hidden">
            <ProjectDiscussion projectId={projectId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discuss;
