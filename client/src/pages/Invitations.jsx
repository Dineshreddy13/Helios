import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useInvitationStore from '../store/invitationStore';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';

const Invitations = () => {
  const { myInvitations, isLoading, error, fetchMyInvitations, respondToInvitation, clearError } = useInvitationStore();
  const navigate = useNavigate();
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchMyInvitations();
    return () => clearError();
  }, [fetchMyInvitations, clearError]);

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

  return (
    <>
      <Navbar />
      <div className="page-container justify-start pt-8 pb-12 min-h-[calc(100vh-65px)]">
        <div className="w-full max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Pending Invitations</h1>
            <p className="text-gray-400">Manage your incoming project invitations.</p>
          </div>

          {error && (
            <div className="alert-error flex justify-between items-center mb-6">
              <span>{error}</span>
              <button onClick={clearError} className="text-red-400 hover:text-red-300">×</button>
            </div>
          )}

          {isLoading && myInvitations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Loading invitations...</div>
          ) : myInvitations.length === 0 ? (
            <Card className="text-center py-16 border-dashed border-gray-800">
              <CardContent>
                <h3 className="text-xl font-medium text-white mb-2">No pending invitations</h3>
                <p className="text-gray-400">You're all caught up!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myInvitations.map((inv) => (
                <Card key={inv.id} className="flex flex-col">
                  <CardHeader className="mb-4">
                    <CardTitle className="text-lg">{inv.project.name}</CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                      {inv.project.description || 'No description provided.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-4 border-t border-gray-800/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="text-sm text-gray-400">
                        Invited by <span className="text-white font-medium">{inv.invitedBy.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="secondary" 
                          onClick={() => handleRespond(inv.id, 'rejected')}
                          disabled={processingId === inv.id}
                        >
                          Decline
                        </Button>
                        <Button 
                          onClick={() => handleRespond(inv.id, 'accepted', inv.project.id)}
                          disabled={processingId === inv.id}
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Invitations;
