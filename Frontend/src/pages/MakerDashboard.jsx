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
import { toast } from 'sonner';

/**
 * MakerDashboard - Regex builder page for MAKER role
 * Allows creating, testing, and saving regex patterns
 */
const MakerDashboard = () => {
  const [regexPattern, setRegexPattern] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [extractedData, setExtractedData] = useState(defaultExtractedData);
  
  const { parseMessage } = useParserStore();
  const { saveDraft, submitForApproval } = useRegexStore();
  const { user } = useAuthStore();

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

  const handleSaveDraft = () => {
    if (!user) return;
    
    saveDraft({
      pattern: regexPattern,
      testMessage,
    }, user.id);
    
    toast.success('Draft saved successfully');
  };

  const handleSubmit = async () => {
    if (!regexPattern.trim() || !testMessage.trim()) {
      toast.error('Please fill in both pattern and test message');
      return;
    }

    try {
      await submitForApproval(regexPattern, testMessage);
      toast.success('Submitted for approval');
      
      // Clear the textareas
      setRegexPattern('');
      setTestMessage('');
      setExtractedData(defaultExtractedData);
    } catch (error) {
      toast.error('Failed to submit for approval');
    }
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
        <div className="space-y-6">
          {/* Regex Builder Section */}
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
        </div>
      </main>
    </div>
  );
};

export default MakerDashboard;