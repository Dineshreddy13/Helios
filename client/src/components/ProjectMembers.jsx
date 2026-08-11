import React, { useEffect, useState } from 'react';
import useInvitationStore from '../store/invitationStore';
import { searchUsersApi } from '../api/user.api';
import Input from './Input';
import Button from './Button';
import Badge from './Badge';

const ProjectMembers = ({ projectId, isOwner }) => {
  const { 
    projectMembers, 
    projectInvitations, 
    fetchProjectMembers, 
    fetchProjectInvitations, 
    inviteUser,
    isLoading,
    error,
    clearError
  } = useInvitationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [invitingId, setInvitingId] = useState(null);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    fetchProjectMembers(projectId);
    if (isOwner) {
      fetchProjectInvitations(projectId);
    }
    return () => clearError();
  }, [projectId, isOwner, fetchProjectMembers, fetchProjectInvitations, clearError]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const search = async () => {
      if (!debouncedQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await searchUsersApi(debouncedQuery);
        // Filter out existing members and pending invites
        const memberIds = new Set(projectMembers.map(m => m.user.id));
        const invitedIds = new Set(projectInvitations.map(i => i.invitedUser.id));
        
        const filtered = response.users.filter(u => !memberIds.has(u.id) && !invitedIds.has(u.id));
        setSearchResults(filtered);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    };
    search();
  }, [debouncedQuery, projectMembers, projectInvitations]);

  const handleInvite = async (userId) => {
    setInvitingId(userId);
    setLocalError(null);
    try {
      await inviteUser(projectId, userId);
      setSearchQuery(''); // clear search on success
      setSearchResults([]);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to invite user');
    } finally {
      setInvitingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {(error || localError) && (
        <div className="alert-error flex justify-between items-center">
          <span>{error || localError}</span>
          <button onClick={() => { clearError(); setLocalError(null); }} className="text-red-400 hover:text-red-300">×</button>
        </div>
      )}

      {isOwner && (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Invite people</h3>
            <div className="relative">
              <Input 
                placeholder="Search by username or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-0"
              />
              
              {/* Dropdown for search results */}
              {searchQuery.trim().length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-3 text-sm text-gray-500 text-center">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 hover:bg-[var(--border-color)] transition-colors border-b border-[var(--border-color)] last:border-0">
                        <div>
                          <div className="font-medium text-sm text-white">{user.username}</div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                        <Button 
                          variant="secondary" 
                          className="text-xs py-1 px-2 h-auto whitespace-nowrap"
                          onClick={() => handleInvite(user.id)}
                          disabled={invitingId === user.id}
                        >
                          {invitingId === user.id ? 'Inviting...' : 'Invite'}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-gray-500 text-center">No matching users found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {projectInvitations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">Pending Invitations</h4>
              <div className="flex flex-col gap-2">
                {projectInvitations.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-md bg-[var(--card-bg)]">
                    <div>
                      <div className="font-medium text-sm text-white">{inv.invitedUser.username}</div>
                      <div className="text-xs text-gray-400">{inv.invitedUser.email}</div>
                    </div>
                    <Badge variant="member" className="text-gray-400 border-gray-600 bg-transparent">Pending</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3">Members ({projectMembers.length})</h3>
        {isLoading && projectMembers.length === 0 ? (
          <div className="text-sm text-gray-500">Loading members...</div>
        ) : (
          <div className="flex flex-col gap-2">
            {projectMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-md bg-[var(--card-bg)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-medium uppercase border border-gray-700 text-gray-300">
                    {member.user.username.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-white">{member.user.username}</div>
                    <div className="text-xs text-gray-400">{member.user.email}</div>
                  </div>
                </div>
                <Badge variant={member.role}>{member.role}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectMembers;
