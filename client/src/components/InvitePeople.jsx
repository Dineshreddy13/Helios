import React, { useEffect, useState } from 'react';
import useInvitationStore from '../store/invitationStore';
import { searchUsersApi } from '../api/user.api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Command, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem 
} from '@/components/ui/command';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
  ItemActions,
} from "@/components/ui/item";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const InvitePeople = ({ projectId }) => {
  const { 
    projectMembers, 
    projectInvitations, 
    fetchProjectInvitations, 
    inviteUser,
    error,
    clearError
  } = useInvitationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [invitingId, setInvitingId] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchProjectInvitations(projectId);
    return () => clearError();
  }, [projectId, fetchProjectInvitations, clearError]);

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

  // Reset search when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setLocalError(null);
    }
  }, [isDialogOpen]);

  const handleInvite = async (userId) => {
    setInvitingId(userId);
    setLocalError(null);
    try {
      await inviteUser(projectId, userId);
      setSearchQuery(''); 
      setSearchResults([]);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to invite user');
    } finally {
      setInvitingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Invite people</h3>
          <p className="text-sm text-muted-foreground">Add new members to collaborate on this project.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Invite</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden" showCloseButton={false}>
            <Command className="border-none">
              <CommandInput 
                placeholder="Search by username or email..." 
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="border-none focus:ring-0"
              />
              <CommandList className="max-h-[300px]">
                {isSearching ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">Searching...</div>
                ) : searchQuery.trim().length > 0 && searchResults.length === 0 ? (
                  <CommandEmpty>No matching users found.</CommandEmpty>
                ) : (
                  searchResults.length > 0 && (
                    <CommandGroup heading="Results">
                      {searchResults.map(user => (
                        <CommandItem key={user.id} onSelect={() => handleInvite(user.id)} className="justify-between px-3 py-2">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium leading-none">{user.username}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            className="h-7 text-xs px-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInvite(user.id);
                            }}
                            disabled={invitingId === user.id}
                          >
                            {invitingId === user.id ? 'Inviting...' : 'Invite'}
                          </Button>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )
                )}
              </CommandList>
            </Command>
            {(error || localError) && (
              <div className="p-3 text-sm text-destructive bg-destructive/10">
                {error || localError}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {projectInvitations.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Pending Invitations</h4>
          <div className="flex flex-col gap-3">
            {projectInvitations.map(inv => (
              <Item key={inv.id} variant="outline" className="bg-card">
                <ItemContent>
                  <ItemTitle>{inv.invitedUser.username}</ItemTitle>
                  <ItemDescription>{inv.invitedUser.email}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Badge variant="outline" className="text-muted-foreground">Pending</Badge>
                </ItemActions>
              </Item>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitePeople;
