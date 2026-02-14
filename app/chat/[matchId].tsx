import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { messageService, type Message } from '@/lib/services/message.service';
import { matchService, type MatchDetails } from '@/lib/services/match.service';
import { socketService } from '@/lib/services/socket.service';
import { useAuth } from '@/contexts/auth-context';

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
  const [showMatchCard, setShowMatchCard] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    // Configure navigation header
    navigation.setOptions({
      headerShown: false,
    });

    fetchChatData();
    connectSocket();

    return () => {
      isMounted.current = false;
      if (conversationId) {
        socketService.leaveConversation(conversationId);
      }
      socketService.off('new_message');
      socketService.off('typing');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [matchId, user?.id]);

  const connectSocket = async () => {
    try {
      if (!socketService.isConnected()) {
        await socketService.connect();
      }

      socketService.off('new_message');
      socketService.off('typing');

      socketService.onJoinedConversation((data: any) => {
        console.log(
          '[Anointed Innovations] Successfully joined conversation:',
          data,
        );
      });

      socketService.onNewMessage((message: Message) => {
        if (isMounted.current) {
          setMessages((prev) => {
            const currentMessages = Array.isArray(prev) ? prev : [];
            return [...currentMessages, message];
          });
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      });

      socketService.onTyping((data: any) => {
        if (isMounted.current && data.userId !== user?.id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 2000);
        }
      });
    } catch (error) {
      console.error('[Anointed Innovations] Error connecting socket:', error);
    }
  };

  const handleTyping = useCallback(() => {
    if (!conversationId) return;

    socketService.sendTyping(conversationId, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendTyping(conversationId, false);
      if (isMounted.current) {
        setIsTyping(true);
      }
    }, 1000);
  }, [conversationId]);

  const fetchChatData = async () => {
    try {
      setLoading(true);
      if (matchId && user?.id && isMounted.current) {
        const conversation = await messageService.getOrCreateConversation(
          matchId as string,
        );
        setConversationId(conversation.id);

        const matchDetails = await matchService.getMatchDetails(
          matchId as string,
        );
        setReceiverInfo(matchDetails);

        // Fetch existing messages
        const existingMessages = await messageService.getMessages(
          conversation.id,
        );
        setMessages(existingMessages);

        socketService.joinConversation(conversation.id);
      }
    } catch (error) {
      console.error('[Anointed Innovations] Error fetching chat:', error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !conversationId || !user?.id) return;

    try {
      setSending(true);

      await messageService.sendMessage(
        conversationId,
        messageText.trim(),
        'text',
      );

      setMessageText('');
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('[Anointed Innovations] Error sending message:', error);
    } finally {
      if (isMounted.current) {
        setSending(false);
      }
    }
  }, [conversationId, user?.id, messageText]);

  const calculateAge = (dateOfBirth: string | undefined): number | null => {
    if (!dateOfBirth) return null;
    return Math.floor(
      (new Date().getTime() - new Date(dateOfBirth).getTime()) /
        (365.25 * 24 * 60 * 60 * 1000),
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.senderId === user?.id;

    return (
      <View
        className={`mb-4 flex-row ${isOwn ? 'justify-end' : 'justify-start'} items-end`}
      >
        {!isOwn && (
          <Avatar className="mr-2 mb-1 w-8 h-8">
            {receiverInfo?.photos?.[0] && (
              <AvatarImage source={{ uri: receiverInfo.photos[0].photo_url }} />
            )}
            <AvatarFallback className="bg-slate-300">
              <Text className="text-white font-semibold text-xs">
                {receiverInfo?.first_name?.charAt(0) || '?'}
              </Text>
            </AvatarFallback>
          </Avatar>
        )}

        <Card className={`max-w-xs ${isOwn ? 'bg-transparent border-0' : ''}`}>
          <CardContent className="p-0">
            <View
              className={`rounded-2xl px-4 py-3 ${
                isOwn
                  ? 'bg-linear-to-r from-primary to-primary-light rounded-br-none'
                  : 'bg-slate-100 rounded-bl-none border border-slate-200'
              }`}
            >
              {!isOwn && receiverInfo?.first_name && (
                <Text className="text-xs font-semibold text-slate-600 mb-1">
                  {receiverInfo.first_name}
                </Text>
              )}
              <Text
                className={`text-base ${isOwn ? 'text-white' : 'text-slate-800'}`}
              >
                {item.content}
              </Text>
              <Text
                className={`text-xs mt-1 ${isOwn ? 'text-primary-light/70' : 'text-slate-500'}`}
              >
                {new Date(item.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {!item.read && isOwn && ' • ✓'}
              </Text>
            </View>
          </CardContent>
        </Card>

        {isOwn && user?.photos?.[0] && (
          <Avatar className="ml-2 mb-1 w-8 h-8">
            <AvatarImage source={{ uri: user.photos[0].photo_url }} />
            <AvatarFallback className="bg-primary">
              <Text className="text-white font-semibold text-xs">
                {user?.first_name?.charAt(0) || 'Y'}
              </Text>
            </AvatarFallback>
          </Avatar>
        )}
      </View>
    );
  };

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0891B2" />
        <Text className="mt-4 text-slate-600">Loading conversation...</Text>
      </View>
    );
  }

  const age = calculateAge(receiverInfo?.date_of_birth);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className="flex-1 bg-white">
        {/* Custom Header - Don't rely on Stack navigation header */}
        <View className="bg-white border-b border-slate-100 px-4 py-4">
          <View className="flex-row items-center justify-between mb-3">
            <TouchableOpacity
              onPress={handleBack}
              className="flex-row items-center"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={24} color="#0891B2" />
              <Text className="ml-2 text-primary font-semibold">Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowMatchCard(!showMatchCard)}
              className="flex-row items-center flex-1 ml-4"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Avatar className="mr-3 w-10 h-10 border-2 border-primary/20">
                {receiverInfo?.photos?.[0] && (
                  <AvatarImage
                    source={{ uri: receiverInfo.photos[0].photo_url }}
                  />
                )}
                <AvatarFallback className="bg-linear-to-br from-primary to-primary/80">
                  <Text className="text-white font-semibold">
                    {receiverInfo?.first_name?.charAt(0) || 'M'}
                  </Text>
                </AvatarFallback>
              </Avatar>
              <View className="flex-1">
                <Text className="font-bold text-slate-900 text-lg">
                  {receiverInfo?.first_name}
                </Text>
                <Text className="text-primary text-sm font-medium">
                  Active now
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          {isTyping && (
            <View className="px-2 py-1">
              <Text className="text-primary text-sm">
                {receiverInfo?.first_name} is typing...
              </Text>
            </View>
          )}
        </View>

        {/* Receiver Info Card */}
        {showMatchCard && receiverInfo && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mx-4 mb-4"
          >
            <Card className="border-primary/20 shadow-sm bg-linear-to-br from-primary/5 to-transparent min-w-[300px] mr-3">
              <CardContent className="p-4">
                <View className="flex-row items-center mb-4">
                  <Avatar className="mr-3 w-12 h-12 border-2 border-primary/30">
                    {receiverInfo?.photos?.[0] && (
                      <AvatarImage
                        source={{ uri: receiverInfo.photos[0].photo_url }}
                      />
                    )}
                    <AvatarFallback className="bg-linear-to-br from-primary to-primary/80">
                      <Text className="text-white font-semibold">
                        {receiverInfo?.first_name?.charAt(0) || 'M'}
                      </Text>
                    </AvatarFallback>
                  </Avatar>
                  <View>
                    <Text className="font-bold text-slate-900 text-lg">
                      {receiverInfo?.first_name}
                    </Text>
                    <Text className="text-primary text-sm font-medium">
                      {age ? `${age} years old` : 'Age unknown'}
                    </Text>
                  </View>
                </View>
                <Text className="text-slate-700 text-sm leading-relaxed">
                  {receiverInfo?.bio || 'Start your conversation!'}
                </Text>
              </CardContent>
            </Card>
          </ScrollView>
        )}

        {/* Messages */}
        {messages.length === 0 ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            className="p-6"
          >
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                <MessageCircle size={32} color="#0891B2" />
              </View>
              <Text className="text-xl font-bold text-slate-900 mb-2">
                Say Hello!
              </Text>
              <Text className="text-slate-600 text-center text-sm leading-relaxed max-w-xs">
                Start a conversation with {receiverInfo?.first_name}. Share what
                makes you unique!
              </Text>
            </View>
          </ScrollView>
        ) : (
          <FlatList
            ref={flatListRef}
            data={Array.isArray(messages) ? messages : []}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 16,
              flexGrow: 1,
            }}
            inverted
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input */}
        <View className="border-t border-slate-100 p-4 bg-white">
          <View className="flex-row items-end gap-3">
            <View className="flex-1 bg-slate-100 rounded-full px-4 py-3 border border-slate-200">
              <TextInput
                className="text-slate-800"
                placeholder={`Message ${receiverInfo?.first_name || '...'}...`}
                placeholderTextColor="#cbd5e1"
                value={messageText}
                onChangeText={(text) => {
                  setMessageText(text);
                  handleTyping();
                }}
                editable={!sending}
                multiline
                maxLength={500}
              />
            </View>
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={sending || !messageText.trim()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  sending || !messageText.trim() ? '#e2e8f0' : '#0891B2',
              }}
            >
              {sending ? (
                <ActivityIndicator size="small" color="cyan" />
              ) : (
                <Send size={20} color="purple" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
