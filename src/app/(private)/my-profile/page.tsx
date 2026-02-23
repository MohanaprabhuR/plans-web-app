"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuth from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera, CircleAlert, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import client from "@/api/client";
import { toast } from "sonner";
import { Alert, AlertTitle } from "@/components/ui/alert";

const AVATAR_BUCKET = "avatars";

function parseFullName(fullName: string | undefined): {
  first: string;
  last: string;
} {
  if (!fullName?.trim()) return { first: "", last: "" };
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0] ?? "";
  const last = parts.slice(1).join(" ") ?? "";
  return { first, last };
}

const MyProfilePage = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [saving, setSaving] = useState(false);

  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    const { first, last } = parseFullName(user.user_metadata?.full_name);
    setFirstName(first);
    setLastName(last);
    setEmail(user.email ?? "");
    setPhone((user.user_metadata?.phone_number as string) ?? "");
    setAddress((user.user_metadata?.address as string) ?? "");
    setCity((user.user_metadata?.city as string) ?? "");
    setState((user.user_metadata?.state as string) ?? "");
    setZipCode((user.user_metadata?.zip_code as string) ?? "");
  }, [user]);

  const cancelEditing = () => {
    if (!user) return;
    const { first, last } = parseFullName(user.user_metadata?.full_name);
    setFirstName(first);
    setLastName(last);
    setEmail(user.email ?? "");
    setPhone((user.user_metadata?.phone_number as string) ?? "");
    setAddress((user.user_metadata?.address as string) ?? "");
    setCity((user.user_metadata?.city as string) ?? "");
    setState((user.user_metadata?.state as string) ?? "");
    setZipCode((user.user_metadata?.zip_code as string) ?? "");
    setIsEditing(false);
  };

  const cancelPasswordEditing = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEditingPassword(false);
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();
    if (!trimmedCurrent) {
      toast.custom(() => (
        <Alert variant="error">
          <CircleAlert className="size-4" />
          <AlertTitle>Enter your current password.</AlertTitle>
        </Alert>
      ));
      return;
    }
    if (trimmedNew.length < 6) {
      toast.custom(() => (
        <Alert variant="error">
          <CircleAlert className="size-4" />
          <AlertTitle>New password must be at least 6 characters.</AlertTitle>
        </Alert>
      ));
      return;
    }
    if (trimmedNew !== trimmedConfirm) {
      toast.custom(() => (
        <Alert variant="error">
          <CircleAlert className="size-4" />
          <AlertTitle>
            New password and confirm password do not match.
          </AlertTitle>
        </Alert>
      ));
      return;
    }
    setSavingPassword(true);
    try {
      const { error: signInError } = await client.auth.signInWithPassword({
        email: user.email,
        password: trimmedCurrent,
      });
      if (signInError) {
        toast.custom(() => (
          <Alert variant="error">
            <CircleAlert className="size-4" />
            <AlertTitle>Current password is incorrect.</AlertTitle>
          </Alert>
        ));
        return;
      }
      const { error } = await client.auth.updateUser({ password: trimmedNew });
      if (error) {
        toast.custom(() => (
          <Alert variant="error">
            <CircleAlert className="size-4" />
            <AlertTitle>Failed to update password.</AlertTitle>
          </Alert>
        ));
        return;
      }

      toast.custom(() => (
        <Alert variant="success">
          <CircleAlert className="size-4" />
          <AlertTitle>Password updated.</AlertTitle>
        </Alert>
      ));
      cancelPasswordEditing();
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const fullName = [firstName.trim(), lastName.trim()]
        .filter(Boolean)
        .join(" ");
      const updates: {
        email?: string;
        data: Record<string, string | undefined>;
      } = {
        data: {
          full_name: fullName || undefined,
          phone_number: phone.trim() || undefined,
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          zip_code: zipCode.trim() || undefined,
        },
      };
      const newEmail = email.trim();
      if (newEmail && newEmail !== user.email) updates.email = newEmail;
      const { error } = await client.auth.updateUser(updates);
      if (error) {
        toast.custom(() => (
          <Alert variant="error">
            <CircleAlert className="size-4" />
            <AlertTitle>
              {error.message || "Failed to update profile."}
            </AlertTitle>
          </Alert>
        ));
        return;
      }
      await client.auth.refreshSession();
      toast.custom(() => (
        <Alert variant="success">
          <CircleAlert className="size-4" />
          <AlertTitle>Profile updated.</AlertTitle>
        </Alert>
      ));
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setSelectedFile(null);
    }
    setIsModalOpen(open);
  };

  const handleUploadProfileImage = async () => {
    if (!user?.id || !selectedFile) return;
    setUploading(true);
    try {
      const ext = selectedFile.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await client.storage
        .from(AVATAR_BUCKET)
        .upload(path, selectedFile, { upsert: true });

      if (uploadError) {
        const msg = uploadError.message ?? "";
        if (/invalid api key/i.test(msg)) {
          toast.custom(() => (
            <Alert variant="error">
              <CircleAlert className="size-4" />
              <AlertTitle>
                Supabase API key is missing or wrong. Add
                NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to
                .env.local in the project root (anon key from Supabase Dashboard
                → Settings → API). Then run: rm -rf .next && npm run dev. Check
                /api/env-check to verify.
              </AlertTitle>
            </Alert>
          ));
        } else if (uploadError.message?.includes("Bucket not found")) {
          toast.custom(() => (
            <Alert variant="error">
              <CircleAlert className="size-4" />
              <AlertTitle>
                Avatar storage is not set up. Create an avatars bucket in
                Supabase Storage with public read access.
              </AlertTitle>
            </Alert>
          ));
          toast.custom(() => (
            <Alert variant="error">
              <CircleAlert className="size-4" />
              <AlertTitle>
                Avatar storage is not set up. Create an avatars bucket in
                Supabase Storage with public read access.
              </AlertTitle>
            </Alert>
          ));
        } else {
          toast.custom(() => (
            <Alert variant="error">
              <CircleAlert className="size-4" />
              <AlertTitle>{msg || "Upload failed."}</AlertTitle>
            </Alert>
          ));
        }
        return;
      }

      const {
        data: { publicUrl },
      } = client.storage.from(AVATAR_BUCKET).getPublicUrl(path);
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await client.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });

      if (updateError) {
        const msg = updateError.message ?? "";
        if (/invalid api key/i.test(msg)) {
          toast.custom(() => (
            <Alert variant="error">
              <CircleAlert className="size-4" />
              <AlertTitle>
                Supabase API key is missing or wrong. Add
                NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to
                .env.local in the project root. Then run: rm -rf .next && npm
                run dev. Check /api/env-check to verify.
              </AlertTitle>
            </Alert>
          ));
        } else {
          toast.custom(() => (
            <Alert variant="error">
              <CircleAlert className="size-4" />
              <AlertTitle>{msg || "Failed to update profile."}</AlertTitle>
            </Alert>
          ));
        }
        return;
      }

      await client.auth.refreshSession();
      toast.custom(() => (
        <Alert variant="success">
          <CircleAlert className="size-4" />
          <AlertTitle>Profile picture updated.</AlertTitle>
        </Alert>
      ));
      handleModalClose(false);
    } finally {
      setUploading(false);
    }
  };

  const currentAvatarUrl =
    user?.user_metadata?.avatar_url ||
    "https://mockmind-api.uifaces.co/content/human/80.jpg";
  const displaySrc = previewUrl || currentAvatarUrl;

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent size="lg">
          <DialogTitle>Change Profile Picture</DialogTitle>
          <FieldGroup>
            <Field>
              <FieldLabel>Profile Picture</FieldLabel>
              <div className="flex flex-col gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  variant="outline"
                  size="lg"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {displaySrc ? (
                  previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Selected"
                      className=" rounded-full object-cover"
                      width={100}
                      height={100}
                    />
                  ) : (
                    ""
                  )
                ) : (
                  <span className="text-muted-foreground text-sm">
                    No image
                  </span>
                )}
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    {selectedFile.name}
                  </p>
                )}
              </div>
            </Field>
          </FieldGroup>

          <DialogFooter className="flex justify-end">
            <Button
              variant="outline"
              size="md"
              onClick={() => handleModalClose(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              size="md"
              onClick={handleUploadProfileImage}
              disabled={!selectedFile || uploading}
            >
              {uploading ? "Uploading…" : "Change Profile Picture"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <h1 className="font-medium text-3xl leading-8 tracking-4 text-accent-foreground">
        My Profile
      </h1>
      <div className="flex flex-col lg:flex-row items-start justify-between gap-6 pt-8">
        <div className="flex flex-col gap-4 shrink-0">
          <div className="relative size-30">
            <Avatar className="size-30">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="size-30">
                {user?.user_metadata?.full_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Button
              iconOnly
              size="lg"
              className="absolute -bottom-0.5 right-1.5  rounded-full flex items-center justify-center size-8"
              onClick={() => setIsModalOpen(true)}
            >
              <Camera className="size-5" />
            </Button>
          </div>

          <div>
            <p className="font-medium text-3xl leading-8 tracking-4 text-accent-foreground">
              {user?.user_metadata?.full_name}
            </p>
            <p className="text-muted-foreground text-xl leading-6 tracking-4 pt-1">
              {user?.user_metadata?.email}
            </p>
          </div>
        </div>
        <div className="min-w-0 w-full max-w-[800px]">
          <Tabs
            defaultValue="personal-information"
            variant="underline"
            className="w-full bg-white rounded-2xl p-8 border"
          >
            <TabsList>
              <TabsTrigger value="personal-information">
                Personal Information
              </TabsTrigger>
              <TabsTrigger value="change-password">Change Password</TabsTrigger>
            </TabsList>
            <TabsContent
              value="personal-information"
              className="gap-8 flex flex-col p-0 pt-8"
            >
              <div className="flex  gap-8">
                <FieldGroup>
                  <Field>
                    <FieldLabel>First Name</FieldLabel>
                    <Input
                      id="first-name"
                      type="text"
                      placeholder="Enter first name"
                      variant="outline"
                      size="lg"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={!isEditing}
                    />
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Last Name</FieldLabel>
                    <Input
                      id="last-name"
                      type="text"
                      placeholder="Enter last name"
                      variant="outline"
                      size="lg"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={!isEditing}
                    />
                  </Field>
                </FieldGroup>
              </div>
              <div className="flex  gap-8">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Email Address</FieldLabel>
                    <Input
                      id="email-address"
                      type="email"
                      placeholder="Enter email address"
                      variant="outline"
                      size="lg"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditing}
                    />
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Phone Number</FieldLabel>
                    <Input
                      id="phone-number"
                      type="tel"
                      placeholder="Enter phone number"
                      variant="outline"
                      size="lg"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!isEditing}
                    />
                  </Field>
                </FieldGroup>
              </div>
              <FieldGroup>
                <Field>
                  <FieldLabel>Address</FieldLabel>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Enter address"
                    variant="outline"
                    size="lg"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={!isEditing}
                  />
                </Field>
              </FieldGroup>
              <div className="flex  gap-8">
                <FieldGroup>
                  <Field>
                    <FieldLabel>City</FieldLabel>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Enter city"
                      variant="outline"
                      size="lg"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={!isEditing}
                    />
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field>
                    <FieldLabel>State</FieldLabel>
                    <Input
                      id="state"
                      type="text"
                      placeholder="Enter state"
                      variant="outline"
                      size="lg"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      disabled={!isEditing}
                    />
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Zip Code</FieldLabel>
                    <Input
                      id="zip-code"
                      type="text"
                      placeholder="Enter zip code"
                      variant="outline"
                      size="lg"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      disabled={!isEditing}
                    />
                  </Field>
                </FieldGroup>
              </div>
              <div className="w-full flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={cancelEditing}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? "Saving…" : "Save Profile"}
                    </Button>
                  </>
                ) : (
                  <Button size="lg" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </TabsContent>
            <TabsContent
              value="change-password"
              className="gap-8 flex flex-col p-0 pt-8"
            >
              <FieldGroup>
                <Field>
                  <FieldLabel>Current Password</FieldLabel>
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    variant="outline"
                    size="lg"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={!isEditingPassword}
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((p) => !p)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={
                          showCurrentPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    }
                  />
                </Field>
              </FieldGroup>
              <div className="flex  gap-8">
                <FieldGroup>
                  <Field>
                    <FieldLabel>New Password</FieldLabel>
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      variant="outline"
                      size="lg"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={!isEditingPassword}
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((p) => !p)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label={
                            showNewPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showNewPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      }
                    />
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Confirm New Password</FieldLabel>
                    <Input
                      id="confirm-new-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      size="lg"
                      variant="outline"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={!isEditingPassword}
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((p) => !p)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      }
                    />
                  </Field>
                </FieldGroup>
              </div>
              <div className="w-full flex justify-end gap-2">
                {isEditingPassword ? (
                  <>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={cancelPasswordEditing}
                      disabled={savingPassword}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleChangePassword}
                      disabled={savingPassword}
                    >
                      {savingPassword ? "Updating…" : "Update Password"}
                    </Button>
                  </>
                ) : (
                  <Button size="lg" onClick={() => setIsEditingPassword(true)}>
                    Change Password
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default MyProfilePage;
