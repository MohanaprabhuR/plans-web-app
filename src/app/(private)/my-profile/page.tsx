"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuth from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

const MyProfilePage = () => {
  const { user } = useAuth();

  return (
    <>
      <h1 className="font-medium text-3xl leading-8 tracking-4 text-accent-foreground">
        My Profile
      </h1>
      <div className="flex items-start justify-between gap-4 pt-8">
        <div className="flex  flex-col gap-4">
          <div className="relative size-30">
            <Avatar className="size-30">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="size-30">
                {user?.user_metadata?.full_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 right-1.5 bg-white rounded-full flex items-center justify-center size-8">
              <Camera className="size-5" />
            </div>
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
        <div>
          <Tabs
            defaultValue="personal-information"
            variant="underline"
            className="w-[800px] bg-white rounded-2xl p-8 border"
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
                      placeholder="Enter first Name"
                      variant="outline"
                      size="lg"
                    />
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Last Name</FieldLabel>
                    <Input
                      id="last-name"
                      type="text"
                      placeholder="Enter last Name"
                      variant="outline"
                      size="lg"
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
                    />
                  </Field>
                </FieldGroup>
              </div>
              <div className="w-full flex justify-end">
                <Button size="lg">Edit Profile</Button>
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
                    type="password"
                    placeholder="Enter current password"
                    variant="outline"
                    size="lg"
                  />
                </Field>
              </FieldGroup>
              <div className="flex  gap-8">
                <FieldGroup>
                  <Field>
                    <FieldLabel>New Password</FieldLabel>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      variant="outline"
                      size="lg"
                    />
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Confirm New Password</FieldLabel>
                    <Input
                      id="confirm-new-password"
                      type="password"
                      placeholder="Confirm new password"
                      size="lg"
                      variant="outline"
                    />
                  </Field>
                </FieldGroup>
              </div>
              <div className="w-full flex justify-end">
                <Button size="lg">Change Password</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default MyProfilePage;
