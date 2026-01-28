import { useState, useEffect } from 'react';
import { useParserStore } from '@/stores/parserStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useAuthStore } from '@/stores/authStore';
import { Header } from '@/components/Header';
import { ExtractedDataDisplay } from '@/components/ExtractedDataDisplay';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, ArrowDownCircle, ArrowUpCircle, Trash2, Wallet } from 'lucide-react';

/**
 * UserDashboard - Transaction extraction page for USER role
 * Allows parsing SMS messages, saving transactions, and viewing transaction history
 */
const UserDashboard = () => {
  const [smsText, setSmsText] = useState('');
  const [hasParsed, setHasParsed] = useState(false);
  const [savedTransactions, setSavedTransactions] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  
  const { extractedData, parseMessage, updateExtractedField, isEditing, setIsEditing, resetParser } = useParserStore();
  const { saveTransaction, getTransactionsByUser, getTransactionsByType, deleteTransaction } = useTransactionStore();
  const { user } = useAuthStore();

  useEffect(() => {
    loadTransactions();
  }, [user, filterType]);

  const loadTransactions = () => {
    if (!user) return;
    
    let transactions;
    if (filterType === 'ALL') {
      transactions = getTransactionsByUser(user.id);
    } else {
      transactions = getTransactionsByType(user.id, filterType);
    }
    setSavedTransactions(transactions);
  };

  const handleParse = () => {
    if (smsText.trim()) {
      parseMessage(smsText);
      setHasParsed(true);
      // Check if any fields are missing to enable editing
      const data = useParserStore.getState().extractedData;
      const hasMissing = Object.values(data).some(v => v === '-1');
      setIsEditing(hasMissing);
    }
  };

  const handleFieldChange = (field, value) => {
    updateExtractedField(field, value);
  };

  const handleSaveTransaction = () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    // Validate that required fields are filled
    const requiredFields = ['accountNumber', 'amount', 'type'];
    const missingFields = requiredFields.filter(field => 
      !extractedData[field] || extractedData[field] === '-1'
    );

    if (missingFields.length > 0) {
      toast.error(`Please fill required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Save transaction
    const saved = saveTransaction(extractedData, user.id);
    if (saved) {
      toast.success('Transaction saved successfully!');
      loadTransactions();
      // Reset the form
      setSmsText('');
      setHasParsed(false);
      resetParser();
    }
  };

  const handleDeleteTransaction = (transactionId) => {
    deleteTransaction(transactionId);
    toast.success('Transaction deleted');
    loadTransactions();
  };

  const formatAmount = (amount) => {
    if (!amount || amount === '-1') return '-';
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTypeIcon = (type) => {
    if (type === 'DEBIT') {
      return <ArrowDownCircle className="h-4 w-4 text-red-500" />;
    } else if (type === 'CREDIT') {
      return <ArrowUpCircle className="h-4 w-4 text-green-500" />;
    }
    return null;
  };

  const getTypeBadge = (type) => {
    if (type === 'DEBIT') {
      return <Badge variant="destructive" className="gap-1">{getTypeIcon(type)} Debit</Badge>;
    } else if (type === 'CREDIT') {
      return <Badge variant="default" className="gap-1 bg-green-600">{getTypeIcon(type)} Credit</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  const calculateTotals = () => {
    const debitTotal = savedTransactions
      .filter(t => t.type === 'DEBIT')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    const creditTotal = savedTransactions
      .filter(t => t.type === 'CREDIT')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    return { debitTotal, creditTotal, balance: creditTotal - debitTotal };
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <Tabs defaultValue="extract" className="space-y-6">
          <TabsList>
            <TabsTrigger value="extract">Extract Transaction</TabsTrigger>
            <TabsTrigger value="history">
              Transaction History ({savedTransactions.length})
            </TabsTrigger>
          </TabsList>

          {/* Extract Transaction Tab */}
          <TabsContent value="extract" className="space-y-6">
            {/* SMS Input Section */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Extractor</CardTitle>
                <CardDescription>
                  Paste your transaction SMS to extract structured data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your bank SMS here...&#10;&#10;Example: Alert: Your A/c XX5678 debited for INR 2,500.00 on 10-Jan-26 via UPI to ZOMATO. Avl Bal: INR 15,420.50. Ref No: 60123456789 - HDFC Bank"
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  className="min-h-[120px]"
                />
                <Button onClick={handleParse} disabled={!smsText.trim()}>
                  Parse Transaction
                </Button>
              </CardContent>
            </Card>

            {/* Extracted Data Display */}
            {hasParsed && (
              <>
                <ExtractedDataDisplay
                  data={extractedData}
                  editable={isEditing}
                  onFieldChange={handleFieldChange}
                />
                {isEditing && (
                  <p className="text-sm text-muted-foreground">
                    Some fields could not be extracted. You can manually fill them above.
                  </p>
                )}
                
                {/* Save Button */}
                <Card>
                  <CardContent className="pt-6">
                    <Button 
                      onClick={handleSaveTransaction}
                      className="w-full gap-2"
                      size="lg"
                    >
                      <Save className="h-5 w-5" />
                      Save Transaction
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Transaction History Tab */}
          <TabsContent value="history" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Debits</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatAmount(totals.debitTotal)}
                      </p>
                    </div>
                    <ArrowDownCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Credits</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatAmount(totals.creditTotal)}
                      </p>
                    </div>
                    <ArrowUpCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Net Balance</p>
                      <p className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatAmount(Math.abs(totals.balance))}
                      </p>
                    </div>
                    <Wallet className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Transactions</CardTitle>
                <CardDescription>View transactions by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant={filterType === 'ALL' ? 'default' : 'outline'}
                    onClick={() => setFilterType('ALL')}
                  >
                    All Transactions
                  </Button>
                  <Button
                    variant={filterType === 'DEBIT' ? 'destructive' : 'outline'}
                    onClick={() => setFilterType('DEBIT')}
                    className="gap-2"
                  >
                    <ArrowDownCircle className="h-4 w-4" />
                    Debits Only
                  </Button>
                  <Button
                    variant={filterType === 'CREDIT' ? 'default' : 'outline'}
                    onClick={() => setFilterType('CREDIT')}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <ArrowUpCircle className="h-4 w-4" />
                    Credits Only
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transactions List */}
            <Card>
              <CardHeader>
                <CardTitle>Saved Transactions</CardTitle>
                <CardDescription>
                  {filterType === 'ALL' 
                    ? 'All your saved transactions'
                    : `Showing ${filterType.toLowerCase()} transactions only`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {filterType === 'ALL' 
                        ? 'No transactions saved yet. Start by extracting and saving a transaction!'
                        : `No ${filterType.toLowerCase()} transactions found.`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            {getTypeBadge(transaction.type)}
                            <span className="font-semibold text-lg">
                              {formatAmount(transaction.amount)}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p><strong>Vendor:</strong> {transaction.vendor !== '-1' ? transaction.vendor : 'N/A'}</p>
                            <p><strong>Account:</strong> {transaction.accountNumber !== '-1' ? transaction.accountNumber : 'N/A'}</p>
                            {transaction.date !== '-1' && (
                              <p><strong>Date:</strong> {transaction.date}</p>
                            )}
                            {transaction.transactionId !== '-1' && (
                              <p><strong>Ref ID:</strong> {transaction.transactionId}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

export default UserDashboard;
