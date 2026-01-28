import { useState } from 'react';
import { useParserStore, defaultExtractedData } from '@/stores/parserStore';
import { useRegexStore } from '@/stores/regexStore';
import { useAuthStore } from '@/stores/authStore';
import { Header } from '@/components/Header';
import { ExtractedDataDisplay } from '@/components/ExtractedDataDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

/**
 * CheckerDashboard - Regex approval page for CHECKER role
 * Has all Maker features plus approval/rejection capabilities
 */
const CheckerDashboard = () => {
  const [regexPattern, setRegexPattern] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [extractedData, setExtractedData] = useState(defaultExtractedData);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const { parseMessage } = useParserStore();
  const { saveDraft, approveTemplate, rejectTemplate, getPendingTemplates, templates } = useRegexStore();
  const { user } = useAuthStore();

  const pendingTemplates = getPendingTemplates();

  const handleTestRegex = () => {
    if (testMessage.trim()) {
      const result = parseMessage(testMessage, regexPattern || undefined);
      setExtractedData(result);
    }
  };

  const handleSaveDraft = () => {
    if (!user) return;
    
    saveDraft({
      pattern: regexPattern,
      testMessage,
    }, user.id);
    
    toast.success('Draft saved successfully');
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setRegexPattern(template.pattern);
    setTestMessage(template.testMessage || '');
    
    // Auto-test if there's a test message
    if (template.testMessage) {
      const result = parseMessage(template.testMessage, template.pattern || undefined);
      setExtractedData(result);
    }
  };

  const handleApprove = (templateId) => {
    approveTemplate(templateId);
    setSelectedTemplate(null);
    toast.success('Template approved');
  };

  const handleReject = (templateId) => {
    rejectTemplate(templateId);
    setSelectedTemplate(null);
    toast.success('Template rejected');
  };

  const statusColors = {
    draft: 'secondary',
    pending: 'outline',
    approved: 'default',
    rejected: 'destructive',
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <Tabs defaultValue="approval" className="space-y-6">
          <TabsList>
            <TabsTrigger value="approval">
              Approval Queue ({pendingTemplates.length})
            </TabsTrigger>
            <TabsTrigger value="builder">Regex Builder</TabsTrigger>
            <TabsTrigger value="all">All Templates</TabsTrigger>
          </TabsList>

          {/* Approval Queue Tab */}
          <TabsContent value="approval" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>
                  Review and approve/reject submitted regex templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingTemplates.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No pending templates to review
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pendingTemplates.map(template => (
                      <div
                        key={template.id}
                        className={`p-4 border rounded cursor-pointer transition-colors ${
                          selectedTemplate?.id === template.id ? 'border-primary bg-muted/50' : 'hover:bg-muted/30'
                        }`}
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">Regex Pattern</p>
                            <p className="text-xs text-muted-foreground font-mono mt-1 truncate max-w-md">
                              {template.pattern || 'No pattern'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(template.id);
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(template.id);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview selected template */}
            {selectedTemplate && (
              <div className="space-y-4">
                <ExtractedDataDisplay data={extractedData} editable={false} />
                <div className="flex gap-2">
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(selectedTemplate.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve Regex
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedTemplate.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject Regex
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Regex Builder Tab (same as Maker) */}
          <TabsContent value="builder" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Regex Builder</CardTitle>
                <CardDescription>
                  Create and test regex patterns for SMS parsing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="regex">Regex Pattern</Label>
                  <Input
                    id="regex"
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                    placeholder="Enter regex pattern with named groups..."
                    className="font-mono text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="testSms">Test Message (SMS)</Label>
                  <Textarea
                    id="testSms"
                    placeholder="Paste test SMS here..."
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleTestRegex} disabled={!testMessage.trim()}>
                    Test Regex
                  </Button>
                  <Button variant="outline" onClick={handleSaveDraft}>
                    Save as Draft
                  </Button>
                </div>
              </CardContent>
            </Card>

            <ExtractedDataDisplay data={extractedData} editable={false} />
          </TabsContent>

          {/* All Templates Tab */}
          <TabsContent value="all" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Templates</CardTitle>
              </CardHeader>
              <CardContent>
                {templates.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No templates created yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {templates.map(template => (
                      <div
                        key={template.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div className="flex-1">
                          <p className="font-medium">Regex Pattern</p>
                          <p className="text-xs text-muted-foreground font-mono truncate max-w-md">
                            {template.pattern || 'No pattern'}
                          </p>
                        </div>
                        <Badge variant={statusColors[template.status]}>
                          {template.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CheckerDashboard;
