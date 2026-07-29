"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useUser } from "@/context/user";
import { useToastNotification } from "@/context/toastNotification";
import { compressImageUpload } from "@/utils/image";
import { ping } from "@/services/image";
import { countries } from "@/lib/countries";
import Loading from "@/components/common/loading";
import SelectMenu from "@/components/ui/select-menu";
import { PageHeader } from "@/components/dashboard/table";
import {
  Button,
  Eyebrow,
  Field,
  Input,
  Label,
  Panel,
  Textarea,
} from "@/components/ui";

type ProfileUpdate = Record<string, string>;

function PersonalInfoForm() {
  const { user, updateUser } = useUser();
  const { addNotification } = useToastNotification();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    nationality: user?.nationality || "",
    dob: user?.dob || "",
    gender: user?.gender || "",
    address: user?.address || "",
    image: user?.image || "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    if (!formData.fullName.trim() || !formData.email.trim()) {
      addNotification({ message: "Name and email are required.", error: true });
      return;
    }

    try {
      setLoading(true);
      const updateData: ProfileUpdate = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.mobile,
        image: formData.image,
      };
      await updateUser(updateData);
      addNotification({ message: "Profile updated successfully!" });
    } catch (error) {
      addNotification({
        message:
          (error as string) || "An error occurred while updating your profile.",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) throw Error("No image found");

      const imageUrl = await compressImageUpload(file, 1024);
      setFormData((prev) => ({ ...prev, image: imageUrl }));
      addNotification({ message: "Image uploaded" });
    } catch {
      addNotification({ message: "Failed uploading image", error: true });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Panel>
      <div className="border-b border-line-soft px-6 py-5">
        <h2 className="m-0 font-display text-xl font-semibold">
          Personal information
        </h2>
      </div>

      <div className="p-6">
        <Label>Profile photo</Label>
        <div className="mb-6 flex items-center gap-4">
          {formData.image ? (
            <img
              src={formData.image}
              alt="Profile"
              className="size-16 rounded-full border border-line object-cover"
            />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-full bg-linear-140 from-accent to-[#2A2440] font-display text-lg font-semibold">
              {(user?.fullName || "UF").slice(0, 2).toUpperCase()}
            </span>
          )}
          <label
            htmlFor="profile-image"
            className="cursor-pointer rounded-control border border-line-strong px-4 py-2.5 text-sm text-muted transition-colors hover:text-fg"
          >
            Change
            <input
              type="file"
              id="profile-image"
              accept="image/*"
              onChange={handleImageUpload}
              className="sr-only"
            />
          </label>
          {uploading && <Loading size="sm" />}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name">
            <Input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />
          </Field>
          <Field label="Email address">
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Field>
          <Field label="Mobile number">
            <Input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
            />
          </Field>
          <Field label="Nationality">
            <SelectMenu
              options={countries.map((country) => ({
                label: country,
                value: country,
              }))}
              placeholder="Select country"
              onChange={(value) =>
                setFormData({ ...formData, nationality: value })
              }
              value={formData.nationality}
            />
          </Field>
          <Field label="Date of birth">
            <Input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
          </Field>
          <div>
            <Label>Gender</Label>
            <div className="flex flex-wrap gap-5 pt-2">
              {["male", "female", "others"].map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 text-sm text-muted capitalize"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={option}
                    checked={formData.gender === option}
                    onChange={handleChange}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        </div>

        <Field label="Address" className="mt-4">
          <Textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
          />
        </Field>

        <div className="mt-5 flex justify-end">
          <Button onClick={handleUpdate} disabled={loading}>
            {loading && <Loading color="border-white" size="sm" />}
            Save changes
          </Button>
        </div>
      </div>
    </Panel>
  );
}

function UpdateEmail() {
  const { addNotification } = useToastNotification();
  const { user, updateUser } = useUser();
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!email.trim()) {
      addNotification({ message: "Email is required.", error: true });
      return;
    }
    try {
      setLoading(true);
      await updateUser({ email });
      addNotification({ message: "Email updated successfully!" });
    } catch (error) {
      addNotification({
        message: (error as string) || "An error occurred updating your email.",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel>
      <div className="border-b border-line-soft px-6 py-5">
        <h2 className="m-0 font-display text-xl font-semibold">Update email</h2>
        <Eyebrow className="mt-2">Currently {user?.email}</Eyebrow>
      </div>
      <div className="p-6">
        <Field label="New email address">
          <Input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <div className="mt-5 flex justify-end">
          <Button onClick={handleUpdate} disabled={loading}>
            {loading && <Loading color="border-white" size="sm" />}
            Save email
          </Button>
        </div>
      </div>
    </Panel>
  );
}

function UpdatePassword() {
  const { addNotification } = useToastNotification();
  const { user, updateUser } = useUser();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        addNotification({
          message: "New password must be at least 6 characters.",
          error: true,
        });
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        addNotification({ message: "Passwords do not match", error: true });
        return;
      }
      if (!formData.currentPassword) {
        addNotification({
          message: "Current password is required",
          error: true,
        });
        return;
      }
    }

    try {
      setLoading(true);
      const updateData: ProfileUpdate = {};
      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      await updateUser(updateData);
      addNotification({ message: "Password updated successfully!" });
    } catch (error) {
      addNotification({
        message:
          (error as string) || "An error occurred updating your password.",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel>
      <div className="border-b border-line-soft px-6 py-5">
        <h2 className="m-0 font-display text-xl font-semibold">
          Update password
        </h2>
        <Eyebrow className="mt-2">Signed in as {user?.email}</Eyebrow>
      </div>
      <div className="space-y-4 p-6">
        <Field label="Current password">
          <Input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            placeholder="Enter current password"
            onChange={handleChange}
          />
        </Field>
        <Field label="New password">
          <Input
            type="password"
            name="newPassword"
            placeholder="At least 6 characters"
            value={formData.newPassword}
            onChange={handleChange}
          />
        </Field>
        <Field label="Confirm new password">
          <Input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            placeholder="Repeat new password"
            onChange={handleChange}
          />
        </Field>
        <div className="flex justify-end">
          <Button onClick={handleUpdate} disabled={loading}>
            {loading && <Loading color="border-white" size="sm" />}
            Change password
          </Button>
        </div>
      </div>
    </Panel>
  );
}

export default function Profile() {
  useEffect(() => {
    ping().catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title="Profile" subtitle="Your MileClub account details" />
      <div className="space-y-4">
        <PersonalInfoForm />
        <UpdateEmail />
        <UpdatePassword />
      </div>
    </div>
  );
}
