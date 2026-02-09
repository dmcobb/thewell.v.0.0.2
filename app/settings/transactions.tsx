import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Calendar, DollarSign } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

interface Transaction {
  id: number;
  amount: number;
  plan_type: string;
  card_brand: string;
  card_last_4: string;
  created_at: string;
  status: string;
}

export default function TransactionsScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const AsyncStorage =
        await import('@react-native-async-storage/async-storage');
      const token = await AsyncStorage.default.getItem('authToken');

      const response = await fetch('/api/transactions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.data || []);
      }
    } catch (err) {
      console.error('[Anointed Innovations] Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gradient-to-b from-ocean-100 via-ocean-50 to-ocean-100">
      <LinearGradient
        colors={['#0891B2', '#0284C7', '#8B5CF6', '#0369A1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <View className="p-4">
          <View className="flex-row items-center gap-3">
            <Button variant="ghost" size="sm" onPress={() => router.back()}>
              <ArrowLeft size={24} color="white" />
            </Button>
            <View className="flex-1">
              <Text className="text-xl font-bold text-white">Transactions</Text>
              <Text className="text-purple-100 text-xs">
                Your subscription payment history
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 p-4">
        {loading ? (
          <View className="flex-1 justify-center items-center py-12">
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text className="text-slate-600 mt-3">Loading transactions...</Text>
          </View>
        ) : transactions.length === 0 ? (
          <View className="justify-center items-center py-12">
            <DollarSign size={48} color="#CBD5E1" />
            <Text className="text-slate-600 mt-3 text-center">
              No transactions yet
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {transactions.map((transaction) => (
              <Card
                key={transaction.id}
                className="shadow-lg bg-white/95 overflow-hidden"
              >
                <CardContent className="p-0">
                  <View className="flex-row items-center p-4">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-slate-800 mb-1">
                        {transaction.plan_type}
                      </Text>
                      <View className="flex-row items-center gap-2 mb-2">
                        <Calendar size={14} color="#94A3B8" />
                        <Text className="text-xs text-slate-600">
                          {new Date(transaction.created_at).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <View className="w-2 h-2 rounded-full bg-green-500" />
                        <Text className="text-xs text-slate-600">
                          {transaction.card_brand} ••••{' '}
                          {transaction.card_last_4}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <View className="flex-row items-center gap-1 mb-1">
                        <DollarSign size={16} color="#10B981" />
                        <Text className="text-lg font-bold text-green-600">
                          {transaction.amount.toFixed(2)}
                        </Text>
                      </View>
                      <View className="bg-green-50 rounded px-2 py-1">
                        <Text className="text-xs font-medium text-green-700">
                          {transaction.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
