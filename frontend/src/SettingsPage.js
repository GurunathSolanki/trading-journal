import React from "react";
import { Settings, Shield, Bell, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Data Management</CardTitle>
            </div>
            <CardDescription>Manage your database connection and data backups.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div>
                <p className="font-medium">Backend Integration</p>
                <p className="text-sm text-muted-foreground">Connected to Quarkus API service</p>
              </div>
              <Button variant="outline" size="sm">Verify Status</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Preferences</CardTitle>
            </div>
            <CardDescription>Customize your trading metrics and defaults.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium mb-1">Target Annual Return</p>
                <p className="text-2xl font-bold">16%</p>
                <p className="text-xs text-muted-foreground mt-1">Used for Options required profit</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium mb-1">Risk-Free Rate (Rf)</p>
                <p className="text-2xl font-bold">7%</p>
                <p className="text-xs text-muted-foreground mt-1">Used for Sharpe Ratio calculation</p>
              </div>
            </div>
            <Button className="w-full sm:w-auto">Edit Preferences</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Configure alerts and system messages.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground italic">Notification settings are managed by your browser and system preferences.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
