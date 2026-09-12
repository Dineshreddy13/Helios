import React, { useRef, useState } from 'react';
import useAuthStore from '../store/authStore';
import { updateAvatarApi } from '../api/user.api';
import { toast } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

/**
 * A small dialog exclusively for changing the user's avatar.
 * Controlled externally via open / onOpenChange props.
 */
const AvatarUploadDialog = ({ open, onOpenChange }) => {
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fallback = user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U';

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const data = await updateAvatarApi(selectedFile);
      updateUser({ avatarUrl: data.user.avatarUrl });
      toast.add({ title: 'Avatar updated', type: 'success' });
      handleClose();
    } catch {
      // Error handled by axios interceptor
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setPreview(null);
    setSelectedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Change Avatar</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-2">
          {/* Preview / Current Avatar */}
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Avatar className="size-24 ring-2 ring-border">
              <AvatarImage src={preview || user?.avatarUrl} alt={user?.username} />
              <AvatarFallback className="text-2xl font-semibold uppercase">
                {fallback}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="size-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />

          <p className="text-xs text-muted-foreground text-center">
            Click the avatar to select a photo. JPG, PNG, WebP or GIF — max 5 MB.
          </p>

          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <><Spinner className="mr-2 size-4" /> Uploading…</>
              ) : 'Save Photo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarUploadDialog;
