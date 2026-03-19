import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef, useCallback } from 'react';
import { messageService, type Message } from '@/lib/services/message.service';
import { matchService, type MatchDetails } from '@/lib/services/match.service';
import { socketService } from '@/lib/services/socket.service';
import { useAuth } from '@/contexts/auth-context';
import { LinearGradient } from 'expo-linear-gradient';

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
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversationId) return;
    const textToSend = messageText.trim();
    setMessageText('');
    setSending(true);
    try {
      await messageService.sendMessage(conversationId, textToSend, 'text');
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
              {isTyping ? 'is typing...' : 'Active now'}
            </Text>
          </View>
        </View>
      </View>

      {/* Message List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        inverted // Standard for chat apps
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