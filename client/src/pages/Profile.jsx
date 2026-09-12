import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import { getMyProfileApi, updateProfileApi } from '../api/user.api';
import { toast } from '@/components/ui/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import AvatarUploadDialog from '../components/AvatarUploadDialog';

// ── Info row (right column, always visible) ───────────────────────────────────
const InfoRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-muted-foreground w-28 shrink-0">{label}</span>
      <span className="text-foreground break-all">{value}</span>
    </div>
  );
};

// ── Social link (left sidebar, view mode) ─────────────────────────────────────
const SocialLink = ({ href, icon, label }) => {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      {icon}
      <span className="truncate">{label}</span>
    </a>
  );
};

// ── Social icons ──────────────────────────────────────────────────────────────
const GithubIcon = () => (
  <svg className="size-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="size-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="size-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const WebIcon = () => (
  <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

// ── Compact labelled input for the sidebar edit form ─────────────────────────
const SidebarField = ({ label, icon, name, value, onChange, placeholder, maxLength, as: As = Input }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs text-muted-foreground flex items-center gap-1.5">
      {icon}{label}
    </label>
    <As
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className="text-sm"
      {...(As === Textarea ? { rows: 3 } : {})}
    />
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  const [form, setForm] = useState({
    displayName: '', bio: '', location: '', status: '',
    githubUrl: '', twitterUrl: '', linkedinUrl: '', websiteUrl: '',
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getMyProfileApi();
        setProfile(data.user);
        populateForm(data.user);
      } catch { /* handled by interceptor */ }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  const populateForm = (u) => setForm({
    displayName: u.displayName || '',
    bio: u.bio || '',
    location: u.location || '',
    status: u.status || '',
    githubUrl: u.githubUrl || '',
    twitterUrl: u.twitterUrl || '',
    linkedinUrl: u.linkedinUrl || '',
    websiteUrl: u.websiteUrl || '',
  });

  const handleEditToggle = () => {
    if (isEditing) populateForm(profile); // cancel → restore
    setIsEditing((v) => !v);
  };

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v.trim() === '' ? null : v.trim()])
    );
    setIsSaving(true);
    try {
      const data = await updateProfileApi(payload);
      const updated = data.user;
      setProfile((p) => ({ ...p, ...updated }));
      updateUser(updated); // propagate to navbar + all avatar renders
      toast.add({ title: 'Profile updated', type: 'success' });
      setIsEditing(false);
    } catch { /* handled by interceptor */ }
    finally { setIsSaving(false); }
  };

  // Keep local avatar in sync when changed via AvatarUploadDialog
  useEffect(() => {
    if (user?.avatarUrl && profile) {
      setProfile((p) => ({ ...p, avatarUrl: user.avatarUrl }));
    }
  }, [user?.avatarUrl]);

  const dp = profile || user;
  const fallback = (dp?.displayName || dp?.username || 'U').charAt(0).toUpperCase();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <>
      <AvatarUploadDialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen} />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8 md:gap-14 items-start">

          {/* ── LEFT sidebar ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-3 md:w-80 shrink-0 w-full">

            {/* Avatar — click to open upload dialog */}
            <button
              onClick={() => setAvatarDialogOpen(true)}
              className="relative group w-full rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              title="Change avatar"
            >
              <Avatar className="w-full h-auto ring-2 ring-border">
                <AvatarImage src={dp?.avatarUrl} alt={dp?.username} />
                <AvatarFallback className="text-4xl font-bold">{fallback}</AvatarFallback>
              </Avatar>
              {/* Camera overlay on hover */}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="size-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </button>

            {/* Name + username */}
            <div className="text-center md:text-left">
              {dp?.displayName && (
                <p className="font-semibold text-lg text-foreground leading-tight">{dp.displayName}</p>
              )}
              <p className="text-muted-foreground text-sm">{dp?.username}</p>
            </div>

            {/* Email + Member since — under username, above Edit button */}
            <div className="flex flex-col gap-1 text-center md:text-left">
              {dp?.email && (
                <p className="text-xs text-muted-foreground">{dp.email}</p>
              )}
              {dp?.createdAt && (
                <p className="text-xs text-muted-foreground">
                  Member since {new Date(dp.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </p>
              )}
            </div>

            {/* Status badge */}
            {dp?.status && (
              <Badge variant="outline" className="text-xs font-normal self-center md:self-start">
                {dp.status}
              </Badge>
            )}

            {/* Edit Profile button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleEditToggle}
              disabled={isSaving}
            >
              {isEditing ? 'Cancel' : 'Edit profile'}
            </Button>

            {/* ── Inline edit form — appears directly below the button ── */}
            {isEditing && (
              <div className="flex flex-col gap-3 border border-border rounded-2xl p-4 bg-muted/30">
                <SidebarField
                  label="Name" name="displayName" value={form.displayName}
                  onChange={handleChange} placeholder="Display name" maxLength={50}
                />
                <div>
                  <SidebarField
                    label="Bio" name="bio" value={form.bio}
                    onChange={handleChange} placeholder="Short bio…" maxLength={300} as={Textarea}
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">{form.bio.length}/300</p>
                </div>
                <SidebarField
                  label="Location" name="location" value={form.location}
                  onChange={handleChange} placeholder="e.g. Hyderabad, India" maxLength={100}
                />
                <SidebarField
                  label="Status" name="status" value={form.status}
                  onChange={handleChange} placeholder="e.g. Available…" maxLength={100}
                />

                <hr className="border-border" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Social links</p>

                <SidebarField label="GitHub" icon={<GithubIcon />} name="githubUrl" value={form.githubUrl}
                  onChange={handleChange} placeholder="https://github.com/…" />
                <SidebarField label="Twitter / X" icon={<TwitterIcon />} name="twitterUrl" value={form.twitterUrl}
                  onChange={handleChange} placeholder="https://x.com/…" />
                <SidebarField label="LinkedIn" icon={<LinkedInIcon />} name="linkedinUrl" value={form.linkedinUrl}
                  onChange={handleChange} placeholder="https://linkedin.com/in/…" />
                <SidebarField label="Website" icon={<WebIcon />} name="websiteUrl" value={form.websiteUrl}
                  onChange={handleChange} placeholder="https://yoursite.com" />

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleEditToggle} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button size="sm" className="flex-1" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <><Spinner className="mr-1.5 size-3.5" />Saving…</> : 'Save'}
                  </Button>
                </div>
              </div>
            )}

            {/* Social links — view mode only */}
            {!isEditing && (
              <div className="flex flex-col gap-2 mt-1">
                <SocialLink href={dp?.githubUrl} icon={<GithubIcon />} label="GitHub" />
                <SocialLink href={dp?.twitterUrl} icon={<TwitterIcon />} label="Twitter / X" />
                <SocialLink href={dp?.linkedinUrl} icon={<LinkedInIcon />} label="LinkedIn" />
                <SocialLink href={dp?.websiteUrl} icon={<WebIcon />} label="Website" />
              </div>
            )}
          </div>

          {/* ── RIGHT column — always visible, never toggled ──────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* Bio */}
            {dp?.bio && (
              <p className="text-sm text-foreground leading-relaxed">{dp.bio}</p>
            )}

            {/* Info rows — location only */}
            <div className="flex flex-col gap-2.5">
              <InfoRow label="Location" value={dp?.location} />
            </div>

            {/* Projects — always visible regardless of edit state */}
            {dp?.projects?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Projects ({dp.projects.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {dp.projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{project.name}</p>
                        {project.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <Badge variant="outline" className="capitalize text-xs">
                          {project.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!dp?.bio && !dp?.location && !dp?.projects?.length && !isEditing && (
              <p className="text-sm text-muted-foreground">
                No profile info yet — click <strong>Edit profile</strong> to get started.
              </p>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default ProfilePage;
