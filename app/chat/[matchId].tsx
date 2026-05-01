import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { messageService, type Message } from '@/lib/services/message.service';
import { matchService, type MatchDetails } from '@/lib/services/match.service';
import { socketService } from '@/lib/services/socket.service';
import { useAuth } from '@/contexts/auth-context';
import { userService } from '@/lib/services/user.service';
import { activityLoggerService } from '@/lib/services/activity-logger.service';

export default function ChatScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { matchId } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [receiverInfo, setReceiverInfo] = useState<MatchDetails | null>(null);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  // BRAND COLORS
  const theme = {
    primary: "#9B7EDE",    // Purple
    secondary: "#2C5F7F",  // Ocean
    background: "#FFFFFF",
    surface: "#F8FAFC",
    border: "#E2E8F0",
    textMain: "#1E293B",
    textMuted: "#64748B",
    myBubble: "#9B7EDE",
    theirBubble: "#F1F5F9"
  };

  useEffect(() => {
    isMounted.current = true;
    navigation.setOptions({ headerShown: false });
    fetchChatData();
    connectSocket();

    return () => {
      isMounted.current = false;
      if (conversationId) socketService.leaveConversation(conversationId);
      socketService.off('new_message');
      socketService.off('typing');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [matchId, user?.id]);

  const connectSocket = async () => {
    try {
      if (!socketService.isConnected()) await socketService.connect();
      socketService.onNewMessage((message: Message) => {
        if (isMounted.current) {
          setMessages((prev) => [message, ...prev]); // Use unshift logic for inverted list
        }
      });
      socketService.onTyping((data: any) => {
        if (isMounted.current && data.userId !== user?.id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      });
    } catch (error) {
      console.error('Socket error:', error);
    }
  };

  const fetchChatData = async () => {
    try {
      setLoading(true);
      if (matchId && isMounted.current) {
        const conversation = await messageService.getOrCreateConversation(matchId as string);
        setConversationId(conversation.id);
        const matchDetails = await matchService.getMatchDetails(matchId as string);
        setReceiverInfo(matchDetails);
        const existingMessages = await messageService.getMessages(conversation.id);
        setMessages(existingMessages);
        socketService.joinConversation(conversation.id);
      }
    } catch (error: any) {
      console.error('[ChatScreen] Error loading chat:', error);
      console.error('[ChatScreen] Error details:', error?.message, error?.response);
      Alert.alert(
        'Error',
        error?.message || 'Failed to load conversation.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversationId) {
      return;
    }
    const textToSend = messageText.trim();
    setMessageText('');
    setSending(true);
    try {
      const sentMessage = await messageService.sendMessage(conversationId, textToSend, 'text');
      // Add sent message to state so it appears in FlatList
      setMessages(prev => [...prev, sentMessage]);
    } catch (error: any) {
      console.error('[ChatScreen] Error sending message:', error);
      console.error('[ChatScreen] Send error details:', error?.message);
      Alert.alert(
        'Failed to Send',
        error?.message || 'Could not send message. Please try again.'
      );
    } finally {
      if (isMounted.current) setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.senderId === user?.id;
    return (
      <View style={{
        flexDirection: 'row',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        marginBottom: 12,
        paddingHorizontal: 4
      }}>
        <View style={{
          maxWidth: '80%',
          backgroundColor: isOwn ? theme.myBubble : theme.theirBubble,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 20,
          borderBottomRightRadius: isOwn ? 4 : 20,
          borderBottomLeftRadius: isOwn ? 20 : 4,
          elevation: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        }}>
          <Text style={{ 
            fontSize: 16, 
            color: isOwn ? '#FFFFFF' : theme.textMain 
          }}>
            {item.content}
          </Text>
          <Text style={{ 
            fontSize: 10, 
            color: isOwn ? 'rgba(255,255,255,0.7)' : theme.textMuted,
            marginTop: 4,
            textAlign: 'right'
          }}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={{ flex: 1, backgroundColor: '#FFF' }}
    >
      {/* Header */}
      <View style={{ 
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF'
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
          <Ionicons name="arrow-back" size={24} color={theme.secondary} />
        </TouchableOpacity>
        
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ 
            width: 40, height: 40, borderRadius: 20, backgroundColor: theme.border, 
            marginRight: 12, overflow: 'hidden' 
          }}>
            {/* Simple Image Fallback */}
            <View style={{ flex: 1, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' }}>
               <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{receiverInfo?.first_name?.[0]}</Text>
            </View>
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textMain }}>
              {receiverInfo?.first_name}
            </Text>
            <Text style={{ fontSize: 12, color: isTyping ? theme.primary : theme.textMuted }}>
              {isTyping ? 'is typing...' : 'Idle'}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => setActionMenuVisible(true)} style={{ padding: 8 }}>
          <Ionicons name="ellipsis-vertical" size={22} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Action Menu Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={actionMenuVisible}
        onRequestClose={() => setActionMenuVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setActionMenuVisible(false)}
        >
          <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingVertical: 32 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textMain, marginBottom: 16 }}>Actions</Text>

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}
              onPress={() => {
                setActionMenuVisible(false);
                setReportModalVisible(true);
              }}
            >
              <Ionicons name="flag-outline" size={22} color="#f59e0b" />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textMain }}>Report User</Text>
                <Text style={{ fontSize: 13, color: theme.textMuted }}>Flag objectionable content or behavior</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}
              onPress={() => {
                setActionMenuVisible(false);
                const matchedUserId = receiverInfo?.user_id;
                if (!matchedUserId) return;
                Alert.alert(
                  'Block User',
                  `Are you sure you want to block ${receiverInfo?.first_name}? They will be removed from your matches and our moderation team will be notified.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Block',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await userService.blockUser(matchedUserId, 'Blocked from chat');
                          if (user?.id) {
                            await activityLoggerService.logBlock(user.id, matchedUserId, 'Blocked from chat');
                          }
                          Alert.alert('Blocked', `${receiverInfo?.first_name} has been blocked.`, [
                            { text: 'OK', onPress: () => router.back() }
                          ]);
                        } catch (error: any) {
                          Alert.alert('Error', error.message || 'Failed to block user.');
                        }
                      },
                    },
                  ]
                );
              }}
            >
              <Ionicons name="shield-outline" size={22} color="#ef4444" />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#ef4444' }}>Block User</Text>
                <Text style={{ fontSize: 13, color: theme.textMuted }}>Remove from matches and notify moderators</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 16, backgroundColor: '#F1F5F9', borderRadius: 24, paddingVertical: 12, alignItems: 'center' }}
              onPress={() => setActionMenuVisible(false)}
            >
              <Text style={{ color: theme.textMuted, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Report Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reportModalVisible}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingVertical: 32, maxHeight: '80%' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.textMain, marginBottom: 8 }}>Report {receiverInfo?.first_name}</Text>
            <Text style={{ fontSize: 13, color: theme.textMuted, marginBottom: 24 }}>Select a reason for your report. Our team will review it within 24 hours.</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { key: 'inappropriate_content', label: 'Inappropriate Content', desc: 'Sexually explicit or offensive material' },
                { key: 'harassment', label: 'Harassment or Bullying', desc: 'Threatening or abusive behavior' },
                { key: 'fake_profile', label: 'Fake Profile', desc: 'Impersonation or misleading information' },
                { key: 'spam', label: 'Spam or Scam', desc: 'Unsolicited or fraudulent activity' },
                { key: 'hate_speech', label: 'Hate Speech', desc: 'Discriminatory or hateful content' },
                { key: 'other', label: 'Other', desc: 'Another reason not listed above' },
              ].map((reason) => (
                <TouchableOpacity
                  key={reason.key}
                  style={{
                    paddingVertical: 14, paddingHorizontal: 16,
                    borderWidth: 1.5, borderRadius: 12, marginBottom: 10,
                    borderColor: selectedReportReason === reason.key ? theme.primary : '#E2E8F0',
                    backgroundColor: selectedReportReason === reason.key ? '#F5F0FF' : '#FFF',
                  }}
                  onPress={() => setSelectedReportReason(reason.key)}
                >
                  <Text style={{ fontSize: 15, fontWeight: '600', color: selectedReportReason === reason.key ? theme.primary : theme.textMain }}>{reason.label}</Text>
                  <Text style={{ fontSize: 13, color: theme.textMuted }}>{reason.desc}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#F1F5F9', borderRadius: 24, paddingVertical: 12, alignItems: 'center' }}
                onPress={() => { setReportModalVisible(false); setSelectedReportReason(null); }}
              >
                <Text style={{ color: theme.textMuted, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: selectedReportReason ? '#ef4444' : '#CBD5E1', borderRadius: 24, paddingVertical: 12, alignItems: 'center' }}
                disabled={!selectedReportReason}
                onPress={async () => {
                  const matchedUserId = receiverInfo?.user_id;
                  if (!matchedUserId || !selectedReportReason) return;
                  try {
                    await userService.reportUser(matchedUserId, selectedReportReason, 'Reported from chat');
                    if (user?.id) {
                      await activityLoggerService.logReport(user.id, matchedUserId, selectedReportReason, 'Reported from chat');
                    }
                    Alert.alert('Report Submitted', 'Thank you for helping keep The Well safe. Our team will review your report within 24 hours.');
                    setReportModalVisible(false);
                    setSelectedReportReason(null);
                  } catch (error: any) {
                    Alert.alert('Error', error.message || 'Failed to submit report.');
                  }
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: '600' }}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Message List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <View style={{ 
        padding: 15, 
        borderTopWidth: 1, 
        borderTopColor: theme.border,
        backgroundColor: '#FFF',
        paddingBottom: Platform.OS === 'ios' ? 30 : 15 
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ 
            flex: 1, 
            backgroundColor: theme.surface, 
            borderRadius: 25, 
            paddingHorizontal: 20, 
            marginRight: 10,
            borderWidth: 1,
            borderColor: theme.border
          }}>
            <TextInput
              placeholder="Type a message..."
              placeholderTextColor={theme.textMuted}
              value={messageText}
              onChangeText={(text) => {
                setMessageText(text);
                socketService.sendTyping(conversationId!, text.length > 0);
              }}
              multiline
              style={{ paddingVertical: 10, color: theme.textMain, maxHeight: 100 }}
            />
          </View>
          <TouchableOpacity 
            onPress={handleSendMessage}
            disabled={!messageText.trim() || sending}
            style={{ 
              width: 48, height: 48, borderRadius: 24, 
              backgroundColor: messageText.trim() ? theme.secondary : theme.border,
              justifyContent: 'center', alignItems: 'center'
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}