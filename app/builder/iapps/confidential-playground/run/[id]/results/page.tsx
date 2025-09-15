"use client";

import { useParams } from "next/navigation";

import AppShell from "@/components/AppShell";
import { ProofBadge } from "@/components/ProofBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const run = useStore((s) => s.runs.find((r) => r.id === id));

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Results</h2>
        <div className="flex items-center gap-2">
          <ProofBadge />
          <Button variant="outline">Share Proof</Button>
        </div>
      </div>

      <Tabs defaultValue="output" className="mt-4">
        <TabsList>
          <TabsTrigger value="output">Output</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="proof">Confidential Proof</TabsTrigger>
        </TabsList>

        <TabsContent value="output">
          <Card>
            <CardHeader><CardTitle>Model Output</CardTitle></CardHeader>
            <CardContent>
              <div className="text-sm text-muted">
                Sample output goes here (chart/table). Model: {run?.model}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader><CardTitle>Execution Logs</CardTitle></CardHeader>
            <CardContent className="text-xs text-muted">
              Coming soon
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proof">
          <Card>
            <CardHeader><CardTitle>Proof</CardTitle></CardHeader>
            <CardContent>
              <div className="text-sm">
                Hash: <span className="text-primary">{run?.proofHash ?? "—"}</span>
              </div>
              <Button variant="outline" className="mt-3">Download Proof JSON</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

