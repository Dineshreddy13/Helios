import { useEffect, useRef, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { SentIcon, Edit02Icon, Delete02Icon, Cancel01Icon, CheckmarkBadge01Icon, Loading03Icon } from 'hugeicons-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
  MessageFooter,
} from '@/components/ui/message';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import useDiscussionStore from '../store/discussionStore';
import useAuthStore from '../store/authStore';

const DiscussionInput = ({ projectId, sendMessage }) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(projectId, content);
      setInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSend}
      className="flex items-center gap-3 px-5 py-3 border-t border-border"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        disabled={isSending}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!input.trim() || isSending}
        className="shrink-0"
      >
        {isSending ? (
          <Loading03Icon className="w-4 h-4 animate-spin" />
        ) : (
          <SentIcon className="w-4 h-4" />
        )}
      </Button>
    </form>
  );
};

const ProjectDiscussion = ({ projectId }) => {
  const { user } = useAuthStore();
  const {
    messages,
    isLoading,
    hasMore,
    fetchMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    setupSocketListeners,
    teardownSocketListeners,
    clearMessages,
  } = useDiscussionStore();

  const [editingId, setEditingId] = useState(null);
  const [editInput, setEditInput] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isInitialLoad = useRef(true);

  // Fetch messages and setup socket listeners
  useEffect(() => {
    clearMessages();
    isInitialLoad.current = true;
    fetchMessages(projectId).then(() => {
      isInitialLoad.current = false;
    });
    setupSocketListeners(projectId);

    return () => {
      teardownSocketListeners(projectId);
      clearMessages();
    };
  }, [projectId, fetchMessages, setupSocketListeners, teardownSocketListeners, clearMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: isInitialLoad.current ? 'instant' : 'smooth' });
    }
  }, [messages]);

  // Load older messages
  const handleLoadMore = useCallback(() => {
    const nextCursor = useDiscussionStore.getState().nextCursor;
    if (nextCursor && !isLoading) {
      const container = messagesContainerRef.current;
      const prevScrollHeight = container?.scrollHeight || 0;

      fetchMessages(projectId, nextCursor).then(() => {
        // Maintain scroll position after prepending older messages
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - prevScrollHeight;
        }
      });
    }
  }, [projectId, isLoading, fetchMessages]);

  // Edit message
  const handleEdit = async (messageId) => {
    const content = editInput.trim();
    if (!content) return;

    try {
      await editMessage(messageId, content);
      setEditingId(null);
      setEditInput('');
    } catch (err) {
      console.error(err);
    }
  };

  // Delete message
  const handleDelete = async (messageId) => {
    try {
      await deleteMessage(messageId);
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (msg) => {
    setEditingId(msg.id);
    setEditInput(msg.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditInput('');
  };

  const getInitials = (username) => {
    return username?.slice(0, 2).toUpperCase() || '??';
  };

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLoadMore}
              disabled={isLoading}
              className="text-xs text-muted-foreground"
            >
              {isLoading ? <Spinner className="w-4 h-4 mr-2" /> : null}
              Load older messages
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
            <p>No messages yet.</p>
            <p className="text-xs">Start the conversation!</p>
          </div>
        )}

        {/* Initial loading */}
        {isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <Spinner className="w-6 h-6 text-muted-foreground" />
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => {
          const isOwn = msg.sender?.id === user?.id;
          const isEditing = editingId === msg.id;

          return (
            <Message key={msg.id} align={isOwn ? 'end' : 'start'}>
              <MessageAvatar>
                <Avatar size="sm">
                  {msg.sender?.avatarUrl ? (
                    <AvatarImage src={`${apiUrl}${msg.sender.avatarUrl}`} alt={msg.sender.username} />
                  ) : null}
                  <AvatarFallback>{getInitials(msg.sender?.username)}</AvatarFallback>
                </Avatar>
              </MessageAvatar>
              <MessageContent>
                <MessageHeader>
                  {msg.sender?.username}
                </MessageHeader>
                {isEditing ? (
                  <div className="flex items-center gap-2 max-w-[85%]">
                    <input
                      type="text"
                      value={editInput}
                      onChange={(e) => setEditInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEdit(msg.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEdit(msg.id)}
                    >
                      <CheckmarkBadge01Icon className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={cancelEdit}
                    >
                      <Cancel01Icon className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ) : (
                  <Bubble variant={isOwn ? 'default' : 'muted'}>
                    <BubbleContent>{msg.content}</BubbleContent>
                  </Bubble>
                )}
                <MessageFooter>
                  <span>{format(new Date(msg.createdAt), 'p')}</span>
                  {msg.isEdited && (
                    <span className="text-[10px] italic">(edited)</span>
                  )}
                  {isOwn && !isEditing && (
                    <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover/message:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => startEdit(msg)}
                        title="Edit"
                      >
                        <Edit02Icon className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(msg.id)}
                        title="Delete"
                      >
                        <Delete02Icon className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </MessageFooter>
              </MessageContent>
            </Message>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <DiscussionInput projectId={projectId} sendMessage={sendMessage} />
    </div>
  );
};

export default ProjectDiscussion;
