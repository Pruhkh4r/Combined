import { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import { Loader2, RefreshCw, Edit, AlertTriangle, Search, CheckCircle2, XCircle } from 'lucide-react';

/**
 * MakerDashboard - Regex builder page for MAKER role
 * Allows creating, testing, saving, and resubmitting regex patterns
 */
const MakerDashboard = () => {
  const [regexPattern, setRegexPattern] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [extractedData, setExtractedData] = useState(defaultExtractedData);
  const [rejectedPatterns, setRejectedPatterns] = useState([]);
  const [failedMessages, setFailedMessages] = useState([]);
  const [isLoadingRejected, setIsLoadingRejected] = useState(false);
  const [isLoadingFailed, setIsLoadingFailed] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');
  const [existingPatternCheck, setExistingPatternCheck] = useState(null); // null | { matched: boolean, patternId, message }
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);
  const [editingFailedPattern, setEditingFailedPattern] = useState(null); // Track if we're editing a failed message
  
  const { parseMessage } = useParserStore();
  const { saveDraft, submitForApproval, fetchRejectedFromBackend, fetchFailedMessages, updateExistingPattern, checkExistingPattern } = useRegexStore();
  const { user } = useAuthStore();

  // Fetch rejected patterns when switching to the rejected tab
  useEffect(() => {
    if (activeTab === 'rejected') {
      loadRejectedPatterns();
    }
  }, [activeTab]);

  // Fetch failed messages when switching to the failed tab
  useEffect(() => {
    if (activeTab === 'failed') {
      loadFailedMessages();
    }
  }, [activeTab]);

  const loadRejectedPatterns = async () => {
    setIsLoadingRejected(true);
    try {
      const patterns = await fetchRejectedFromBackend();
      setRejectedPatterns(patterns);
    } catch (error) {
      console.error('Failed to fetch rejected patterns:', error);
      toast.error('Failed to load rejected patterns');
    } finally {
      setIsLoadingRejected(false);
    }
  };

  const loadFailedMessages = async () => {
    setIsLoadingFailed(true);
    try {
      const messages = await fetchFailedMessages();
      setFailedMessages(messages);
    } catch (error) {
      console.error('Failed to fetch failed messages:', error);
      toast.error('Failed to load failed messages');
    } finally {
      setIsLoadingFailed(false);
    }
  };

  const handleTestRegex = async () => {
    if (testMessage.trim()) {
      try {
        const result = await parseMessage(testMessage, regexPattern || undefined);
        setExtractedData(result);
      } catch (error) {
        toast.error('Failed to test regex pattern');
      }
    }
  };

  // Check if any existing approved pattern matches the test message
  const handleCheckExisting = async () => {
    if (!testMessage.trim()) {
      toast.error('Please enter a test message first');
      return;
    }

    setIsCheckingExisting(true);
    setExistingPatternCheck(null);

    try {
      const result = await checkExistingPattern(testMessage);
      setExistingPatternCheck({
        matched: result.matched,
        patternId: result.patternId,
        pattern: result.pattern,
        message: result.message,
      });
      
      if (result.matched) {
        toast.success('A matching pattern already exists!');
      } else {
        toast.info('No existing pattern matches this message');
      }
    } catch (error) {
      toast.error('Failed to check for existing patterns');
      setExistingPatternCheck({
        matched: false,
        message: 'Error checking patterns',
      });
    } finally {
      setIsCheckingExisting(false);
    }
  };

  // Clear the existing pattern check when message changes
  const handleTestMessageChange = (e) => {
    setTestMessage(e.target.value);
    setExistingPatternCheck(null); // Reset check when message changes
  };

  const handleSaveDraft = async () => {
    if (!user) return;
    
    if (!regexPattern.trim()) {
      toast.error('Please enter a regex pattern');
      return;
    }

    // If editing a failed message, update it instead of creating new
    if (editingFailedPattern) {
      try {
        await updateExistingPattern(
          editingFailedPattern.id,
          regexPattern,
          testMessage,
          'DRAFT'
        );
        toast.success('Failed message updated and saved as draft');
        
        // Clear and reset
        setRegexPattern('');
        setTestMessage('');
        setExtractedData(defaultExtractedData);
        setEditingFailedPattern(null);
        
        // Refresh failed messages list
        loadFailedMessages();
      } catch (error) {
        toast.error('Failed to update pattern');
      }
    } else {
      // Normal draft save (local)
      saveDraft({
        pattern: regexPattern,
        testMessage,
      }, user.id);
      
      toast.success('Draft saved successfully');
    }
  };

  const handleSubmit = async () => {
    if (!regexPattern.trim() || !testMessage.trim()) {
      toast.error('Please fill in both pattern and test message');
      return;
    }

    try {
      // If editing a failed message, update it instead of creating new
      if (editingFailedPattern) {
        await updateExistingPattern(
          editingFailedPattern.id,
          regexPattern,
          testMessage,
          'PENDING'
        );
        toast.success('Failed message updated and submitted for approval');
        
        // Refresh failed messages list
        loadFailedMessages();
        setEditingFailedPattern(null);
      } else {
        await submitForApproval(regexPattern, testMessage);
        toast.success('Submitted for approval');
      }
      
      // Clear the textareas
      setRegexPattern('');
      setTestMessage('');
      setExtractedData(defaultExtractedData);
    } catch (error) {
      toast.error('Failed to submit for approval');
    }
  };

  // Load a rejected pattern into the builder for editing/resubmitting
  const handleEditRejected = (pattern) => {
    setRegexPattern(pattern.pattern || '');
    setTestMessage(pattern.testMessage || '');
    setExtractedData(defaultExtractedData);
    setEditingFailedPattern(null); // Clear any failed pattern editing
    setActiveTab('builder');
    toast.info('Pattern loaded into builder. Edit and resubmit when ready.');
  };

  // Load a failed message into the builder for creating a regex
  const handleLoadFailedMessage = (failedMsg) => {
    setRegexPattern(''); // Failed messages have no regex yet
    setTestMessage(failedMsg.sampleMessage || '');
    setExtractedData(defaultExtractedData);
    setEditingFailedPattern(failedMsg); // Track that we're editing this failed message
    setExistingPatternCheck(null);
    setActiveTab('builder');
    toast.info('Failed message loaded. Create a regex pattern for this message.');
  };

  // Cancel editing a failed message
  const handleCancelEditing = () => {
    setEditingFailedPattern(null);
    setRegexPattern('');
    setTestMessage('');
    setExtractedData(defaultExtractedData);
    toast.info('Editing cancelled');
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
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="builder">
              Regex Builder
              {editingFailedPattern && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Editing
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="failed">
              Failed Messages
              {failedMessages.length > 0 && (
                <Badge variant="outline" className="ml-2 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                  {failedMessages.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected Patterns
              {rejectedPatterns.length > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {rejectedPatterns.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Regex Builder Tab */}
          <TabsContent value="builder" className="space-y-6">
            {/* Editing Failed Message Banner */}
            {editingFailedPattern && (
              <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-amber-700 dark:text-amber-400">
                          Editing Failed Message (ID: {editingFailedPattern.id})
                        </p>
                        <p className="text-sm text-amber-600 dark:text-amber-500">
                          Create a regex pattern for this unmatched message. Saving will update the existing entry.
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCancelEditing}>
                      Cancel Editing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Regex Builder Section */}
            <Card>
              <CardHeader>
                <CardTitle>Regex Builder</CardTitle>
                <CardDescription>
                  {editingFailedPattern 
                    ? 'Write a regex pattern to match this failed message'
                    : 'Create and test regex patterns for SMS parsing'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="regex">Regex Pattern</Label>
                  <Textarea
                    id="regex"
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                    placeholder="Enter regex pattern with named groups..."
                    className="font-mono text-sm min-h-[80px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="testSms">Test Message (SMS)</Label>
                  <Textarea
                    id="testSms"
                    placeholder="Paste test SMS here..."
                    value={testMessage}
                    onChange={handleTestMessageChange}
                    className="min-h-[100px]"
                  />
                  
                  {/* Existing Pattern Check Result */}
                  {existingPatternCheck && (
                    <div className={`flex items-start gap-2 p-3 rounded-lg ${
                      existingPatternCheck.matched 
                        ? 'bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-800' 
                        : 'bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
                    }`}>
                      {existingPatternCheck.matched ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${
                          existingPatternCheck.matched ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'
                        }`}>
                          {existingPatternCheck.matched 
                            ? '✓ Matching pattern found!' 
                            : '✗ No matching pattern exists'}
                        </p>
                        {existingPatternCheck.matched && existingPatternCheck.patternId && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Pattern ID: {existingPatternCheck.patternId}
                          </p>
                        )}
                        {existingPatternCheck.matched && existingPatternCheck.pattern && (
                          <p className="text-xs font-mono text-muted-foreground mt-1 truncate">
                            {existingPatternCheck.pattern}
                          </p>
                        )}
                        {!existingPatternCheck.matched && (
                          <p className="text-xs text-muted-foreground mt-1">
                            You may need to create a new regex pattern for this message type.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleTestRegex} disabled={!testMessage.trim()}>
                    Test Regex
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCheckExisting} 
                    disabled={!testMessage.trim() || isCheckingExisting}
                  >
                    {isCheckingExisting ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-1" />
                    )}
                    Check Existing
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Extracted Data Preview */}
            <ExtractedDataDisplay data={extractedData} editable={false} />

            {/* Regex Metadata & Actions */}
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSaveDraft}>
                    Save as Draft
                  </Button>
                  <Button onClick={handleSubmit}>
                    Submit for Approval
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Failed Messages Tab */}
          <TabsContent value="failed" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-amber-600" />
                      Failed Messages
                    </CardTitle>
                    <CardDescription>
                      Messages that couldn't be matched to any existing regex pattern. Create a new pattern for these.
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={loadFailedMessages}
                    disabled={isLoadingFailed}
                  >
                    {isLoadingFailed ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-1">Refresh</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingFailed ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading failed messages...</span>
                  </div>
                ) : failedMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No failed messages 🎉</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      All incoming messages have been successfully matched to existing patterns.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {failedMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-4 border border-amber-300 rounded-lg bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">ID: {msg.id}</Badge>
                              <Badge variant="outline" className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                                FAILED
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <p className="font-medium text-sm mb-1">Unmatched Message:</p>
                                <p className="text-sm text-muted-foreground bg-background p-3 rounded break-all border">
                                  {msg.sampleMessage || 'No message content'}
                                </p>
                              </div>
                              
                              <p className="text-xs text-amber-600 dark:text-amber-400">
                                ⚠️ No regex pattern exists for this message type
                              </p>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => handleLoadFailedMessage(msg)}
                            className="shrink-0 bg-amber-600 hover:bg-amber-700"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Create Pattern
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rejected Patterns Tab */}
          <TabsContent value="rejected" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Rejected Patterns
                    </CardTitle>
                    <CardDescription>
                      Patterns that were rejected by the checker. Edit and resubmit to fix issues.
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={loadRejectedPatterns}
                    disabled={isLoadingRejected}
                  >
                    {isLoadingRejected ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-1">Refresh</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingRejected ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading rejected patterns...</span>
                  </div>
                ) : rejectedPatterns.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No rejected patterns 🎉</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      All your submissions have been approved or are pending review.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rejectedPatterns.map((pattern) => (
                      <div
                        key={pattern.id}
                        className="p-4 border border-destructive/30 rounded-lg bg-destructive/5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">ID: {pattern.id}</Badge>
                              <Badge variant="destructive">REJECTED</Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <p className="font-medium text-sm mb-1">Regex Pattern:</p>
                                <p className="text-xs text-muted-foreground font-mono bg-background p-2 rounded break-all border">
                                  {pattern.pattern || 'No pattern'}
                                </p>
                              </div>
                              
                              {pattern.testMessage && (
                                <div>
                                  <p className="font-medium text-sm mb-1">Sample Message:</p>
                                  <p className="text-xs text-muted-foreground bg-background p-2 rounded break-all border">
                                    {pattern.testMessage}
                                  </p>
                                </div>
                              )}

                              {pattern.rejectionReason && (
                                <div>
                                  <p className="font-medium text-sm mb-1 text-destructive">Rejection Reason:</p>
                                  <p className="text-xs text-destructive bg-background p-2 rounded border border-destructive/30">
                                    {pattern.rejectionReason}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => handleEditRejected(pattern)}
                            className="shrink-0"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit & Resubmit
                          </Button>
                        </div>
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

export default MakerDashboard;
