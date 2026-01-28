import { useState, useEffect } from 'react';
import { useParserStore, defaultExtractedData } from '@/stores/parserStore';
import { useCheckerStore } from '@/stores/checkerStore';
import { Header } from '@/components/Header';
import { ExtractedDataDisplay } from '@/components/ExtractedDataDisplay';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Loader2, Play, Eye } from 'lucide-react';
import { toast } from 'sonner';

/**
 * CheckerDashboard - Regex approval page for CHECKER role
 * Flow: Load pending regex → Test it → Approve/Reject
 */
const CheckerDashboard = () => {
  const [regexPattern, setRegexPattern] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [extractedData, setExtractedData] = useState(defaultExtractedData);
  const [loadedTemplate, setLoadedTemplate] = useState(null);
  const [hasTestedRegex, setHasTestedRegex] = useState(false);
  const [activeTab, setActiveTab] = useState('approval');
  
  const { parseMessage } = useParserStore();
  const { 
    pendingTemplates,
    isLoading, 
    fetchPendingTemplates, 
    approveTemplate, 
    rejectTemplate,
  } = useCheckerStore();

  // Fetch pending templates from backend on mount
  useEffect(() => {
    fetchPendingTemplates().catch(err => {
      console.error('Failed to fetch pending templates:', err);
      toast.error('Failed to load pending templates');
    });
  }, [fetchPendingTemplates]);

  const handleTestRegex = () => {
    if (testMessage.trim()) {
      const result = parseMessage(testMessage, regexPattern || undefined);
      setExtractedData(result);
      setHasTestedRegex(true);
      toast.success('Regex tested successfully');
    }
  };

  // Load a pending template into the review area
  const handleLoadForReview = (template) => {
    setLoadedTemplate(template);
    setRegexPattern(template.pattern || '');
    setTestMessage(template.sampleMessage || '');
    setExtractedData(defaultExtractedData);
    setHasTestedRegex(false);
    setActiveTab('review');
    toast.info('Template loaded for review. Test the regex before approving.');
  };

  const handleApprove = async () => {
    if (!loadedTemplate) return;
    
    if (!hasTestedRegex) {
      toast.warning('Please test the regex before approving');
      return;
    }
    
    try {
      await approveTemplate(loadedTemplate.id);
      toast.success('Template approved successfully');
      // Clear the review area
      setLoadedTemplate(null);
      setRegexPattern('');
      setTestMessage('');
      setExtractedData(defaultExtractedData);
      setHasTestedRegex(false);
      setActiveTab('approval');
    } catch (err) {
      console.error('Failed to approve template:', err);
      toast.error('Failed to approve template');
    }
  };

  const handleReject = async () => {
    if (!loadedTemplate) return;
    
    try {
      await rejectTemplate(loadedTemplate.id);
      toast.success('Template rejected');
      // Clear the review area
      setLoadedTemplate(null);
      setRegexPattern('');
      setTestMessage('');
      setExtractedData(defaultExtractedData);
      setHasTestedRegex(false);
      setActiveTab('approval');
    } catch (err) {
      console.error('Failed to reject template:', err);
      toast.error('Failed to reject template');
    }
  };

  const handleCancelReview = () => {
    setLoadedTemplate(null);
    setRegexPattern('');
    setTestMessage('');
    setExtractedData(defaultExtractedData);
    setHasTestedRegex(false);
    setActiveTab('approval');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="approval">
              Approval Queue ({pendingTemplates.length})
            </TabsTrigger>
            <TabsTrigger value="review" disabled={!loadedTemplate}>
              Review & Test {loadedTemplate && '⚡'}
            </TabsTrigger>
          </TabsList>

          {/* Approval Queue Tab */}
          <TabsContent value="approval" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>
                  Select a template to load it for review and testing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading pending templates...</span>
                  </div>
                ) : pendingTemplates.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No pending templates to review
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pendingTemplates.map(template => (
                      <div
                        key={template.id}
                        className="p-4 border rounded hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">ID: {template.id}</Badge>
                              <Badge variant="secondary">PENDING</Badge>
                            </div>
                            <p className="font-medium text-sm mb-1">Regex Pattern:</p>
                            <p className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded truncate">
                              {template.pattern || 'No pattern'}
                            </p>
                            {template.sampleMessage && (
                              <>
                                <p className="font-medium text-sm mt-2 mb-1">Sample Message:</p>
                                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded truncate">
                                  {template.sampleMessage}
                                </p>
                              </>
                            )}
                          </div>
                          <Button
                            onClick={() => handleLoadForReview(template)}
                            className="shrink-0"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Load for Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review & Test Tab */}
          <TabsContent value="review" className="space-y-6">
            {loadedTemplate ? (
              <>
                <Card className="border-primary">
                  <CardHeader className="bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Reviewing Template #{loadedTemplate.id}</CardTitle>
                        <CardDescription>
                          Test the regex pattern before approving or rejecting
                        </CardDescription>
                      </div>
                      <Badge variant={hasTestedRegex ? 'default' : 'secondary'}>
                        {hasTestedRegex ? '✓ Tested' : 'Not Tested Yet'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="reviewRegex">Regex Pattern (Read-only)</Label>
                      <Textarea
                        id="reviewRegex"
                        value={regexPattern}
                        readOnly
                        className="font-mono text-sm bg-muted/30 min-h-[80px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reviewTestSms">Test Message (SMS)</Label>
                      <Textarea
                        id="reviewTestSms"
                        placeholder="Enter or modify test SMS..."
                        value={testMessage}
                        onChange={(e) => {
                          setTestMessage(e.target.value);
                          setHasTestedRegex(false);
                        }}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleTestRegex} 
                      disabled={!testMessage.trim()}
                      className="w-full"
                      size="lg"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Test Regex
                    </Button>
                  </CardContent>
                </Card>

                {/* Extracted Data Display */}
                <ExtractedDataDisplay data={extractedData} editable={false} />

                {/* Approval Actions */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex gap-3 justify-center">
                      <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 min-w-[150px]"
                        onClick={handleApprove}
                        disabled={!hasTestedRegex || isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="lg"
                        variant="destructive"
                        className="min-w-[150px]"
                        onClick={handleReject}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={handleCancelReview}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                    {!hasTestedRegex && (
                      <p className="text-center text-sm text-amber-600 mt-3">
                        ⚠️ You must test the regex before approving
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <p className="text-muted-foreground text-center">
                    No template loaded for review. Go to the Approval Queue and select a template.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CheckerDashboard;
