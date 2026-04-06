'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

export default function AccountPage() {
  const { user } = useAuth();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>ENYO Credit</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">
              <CurrencyDisplay amount={0} />
            </p>
            <p className="text-sm text-muted-foreground mt-1">Available balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue={user?.name ?? ''} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user?.email ?? ''} disabled />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue="" />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Shipping Addresses</CardTitle></CardHeader>
          <CardContent>
            <Link href="/account/addresses">
              <Button variant="outline">Manage Addresses</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div>
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input id="confirmNewPassword" type="password" />
              </div>
              <Button type="submit">Update Password</Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        <Card className="border-error/20">
          <CardHeader><CardTitle className="text-error">Danger Zone</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>Delete Account</Button>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => setIsDeleteOpen(false)}
        title="Delete Account"
        description="Are you sure you want to delete your account? All your data including orders and addresses will be permanently removed."
        confirmLabel="Delete My Account"
        isDestructive
      />
    </div>
  );
}
