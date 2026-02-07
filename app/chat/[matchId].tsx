import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, FlatList } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Send } from 'lucide-react-native'
import { useState, useEffect } from 'react'
import { LinearGradient } from 'expo-linear-gradient'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  is_read: boolean
}

export default function ChatScreen() {
  const router = useRouter()
  const { matchId } = useLocalSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [matchInfo, setMatchInfo] = useState<any>(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchChatData()
  }, [matchId])

  const fetchChatData = async () => {
    try {
      setLoading(true)
      // TODO: Implement API call to fetch chat messages and match info
      // const response = await messageService.getMessages(matchId)
      // setMessages(response)
      // setMatchInfo(response.matchInfo)
    } catch (error) {
      console.error('[Anointed Innovations] Error fetching chat:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim()) return

    try {
      setSending(true)
      // TODO: Implement API call to send message
      // await messageService.sendMessage(matchId, messageText)
      setMessageText('')
      // Refresh messages
      await fetchChatData()
    } catch (error) {
      console.error('[Anointed Innovations] Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.sender_id === matchInfo?.current_user_id // TODO: Get current user ID from auth context
    return (
      <View className={`mb-4 flex-row ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <View
          className={`max-w-xs rounded-2xl px-4 py-3 ${isOwn
              ? 'bg-gradient-to-r from-primary to-primary-light rounded-br-none'
              : 'bg-slate-200 rounded-bl-none'
            }`}
        >
          <Text className={`text-base ${isOwn ? 'text-white' : 'text-slate-800'}`}>{item.content}</Text>
          <Text className={`text-xs mt-1 ${isOwn ? 'text-primary-light/70' : 'text-slate-500'}`}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0891B2" />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      <View className="flex-1 bg-white">
        {/* Chat Header */}
        <LinearGradient
          colors={['#0891B2', '#0284C7', '#8B5CF6', '#0369A1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View className="px-4 pt-12 pb-4 flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-1">
              <View className="flex-row items-center gap-3">
                <Avatar className="ring-2 ring-white/30">
                  {matchInfo?.primary_photo ? (
                    <AvatarImage source={{ uri: matchInfo.primary_photo }} />
                  ) : null}
                  <AvatarFallback className="bg-white/20">
                    <Text className="text-white text-lg font-semibold">{matchInfo?.first_name?.[0] || '?'}</Text>
                  </AvatarFallback>
                </Avatar>
                <View>
                  <Text className="text-lg font-semibold text-white">
                    {matchInfo?.first_name} {matchInfo?.last_name}
                  </Text>
                  <Text className="text-purple-100 text-xs">Active now</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Messages List */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: 'flex-end' }}
          inverted
        />

        {/* Message Input */}
        <View className="border-t border-slate-200 p-4 bg-white">
          <View className="flex-row items-center gap-2">
            <TextInput
              className="flex-1 bg-slate-100 rounded-full px-4 py-3 text-slate-800"
              placeholder="Type a message..."
              placeholderTextColor="#94a3b8"
              value={messageText}
              onChangeText={setMessageText}
              editable={!sending}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              className={`w-10 h-10 rounded-full items-center justify-center ${sending || !messageText.trim()
                  ? 'bg-slate-300'
                  : 'bg-gradient-to-r from-primary to-primary-light'
                }`}
              onPress={handleSendMessage}
              disabled={sending || !messageText.trim()}
            >
              <Send size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}