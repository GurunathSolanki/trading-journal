import React from "react";
import { Bell, Database, Percent, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and configuration</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Manage your database connection and data backups.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5">
                <p className="font-medium">Backend Integration</p>
                <p className="text-sm text-muted-foreground">Connected to Quarkus API service</p>
              </div>
              <Button variant="outline" size="sm">Verify Status</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Percent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Target Return</CardTitle>
                <CardDescription>Annual return target for Options</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-900/50">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Target Annual Return</p>
              <p className="text-3xl font-bold font-mono-data text-blue-700 dark:text-blue-300">16%</p>
            </div>
            <Button variant="outline" className="w-full" size="sm">Edit Target</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle>Risk-Free Rate</CardTitle>
                <CardDescription>Used for Sharpe Ratio calculation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50/80 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border border-green-200/50 dark:border-green-900/50">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">Risk-Free Rate (Rf)</p>
              <p className="text-3xl font-bold font-mono-data text-green-700 dark:text-green-300">7%</p>
            </div>
            <Button variant="outline" className="w-full" size="sm">Edit Rate</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure alerts and system messages.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground italic bg-muted/50 p-4 rounded-xl">
              Notification settings are managed by your browser and system preferences.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
