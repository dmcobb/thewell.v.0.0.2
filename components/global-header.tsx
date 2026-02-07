import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import {
  Bell,
  Settings as SettingsIcon,
  Home,
  UserCircle,
  Search,
  Power,
  X,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { useNotification } from '@/contexts/notification-context';
import { Badge } from '@/components/ui/badge';
import AppIcon from '@/components/AppIcon';
import { useState } from 'react';

export function GlobalHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Safely handle user image with fallback
  let userImage = require('../public/placeholder-user.jpg');

  if (user?.photos && Array.isArray(user.photos) && user.photos.length > 0) {
    const primaryPhoto = user.photos.find((p: any) => p.is_primary);
    userImage =
      primaryPhoto?.photo_url || user.photos[0]?.photo_url || userImage;
  }

  const handleLogoutConfirm = async () => {
    setLogoutModalVisible(false);
    if (logout) {
      await logout();
    }
  };

  return (
    <LinearGradient
      colors={['#0891B2', '#0284C7', '#8B5CF6', '#0369A1']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View className="px-4 pt-12 pb-4">
        <View className="flex-row items-center justify-between">
          {/* Brand Side using AppIcon */}
          <View className="flex-row items-center gap-3">
            <AppIcon size={40} rounded="rounded-lg" />
            <View>
              <Text className="text-xl font-bold text-white">The Well</Text>
              <Text className="text-purple-100 text-xs">Christian Dating</Text>
            </View>
          </View>

          {/* Right Side: Notification Bell and User Profile Menu */}
          <View className="flex-row items-center gap-4">
            {/* Notification Bell */}
            <TouchableOpacity
              className="relative"
              onPress={() => router.push('/(tabs)/messages')}
            >
              <Bell size={24} color="white" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 w-5 h-5 items-center justify-center rounded-full">
                  <Text className="text-white text-xs font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </Badge>
              )}
            </TouchableOpacity>

            {/* User Profile Image Trigger */}
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <View className="w-10 h-10 rounded-full border-2 border-primary-light overflow-hidden bg-slate-200">
                <Image
                  source={
                    typeof userImage === 'string'
                      ? { uri: userImage }
                      : userImage
                  }
                  style={{ width: '100%', height: '100%' }}
                  className="w-full h-full"
                  contentFit="cover"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <Text className="text-purple-100 text-sm mt-2">
          Where Hearts Flow Together
        </Text>
      </View>

      {/* Profile Menu Modal */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/10"
          onPress={() => setMenuVisible(false)}
        >
          <View className="absolute top-24 right-4 bg-white rounded-2xl shadow-2xl w-52 overflow-hidden border border-slate-100">
            {/* Close Button Header */}
            <View className="flex-row justify-end p-2 bg-slate-50/50">
              <TouchableOpacity
                onPress={() => setMenuVisible(false)}
                className="p-1 rounded-full bg-slate-200/50"
              >
                <X size={18} color="#647488" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="flex-row items-center p-4 border-b border-slate-50 active:bg-slate-50"
              onPress={() => {
                setMenuVisible(false);
                router.push('/(tabs)');
              }}
            >
              <Home size={20} color="#8B5CF6" />
              <Text className="ml-3 font-medium text-slate-700">Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center p-4 border-b border-slate-50 active:bg-slate-50"
              onPress={() => {
                setMenuVisible(false);
                router.push('/(tabs)/profile');
              }}
            >
              <UserCircle size={20} color="#8B5CF6" />
              <Text className="ml-3 font-medium text-slate-700">Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-4 border-b border-slate-50 active:bg-slate-50"
              onPress={() => {
                setMenuVisible(false);
                router.replace('../browse');
              }}
            >
              <Search size={20} color="#8B5CF6" />
              <Text className="ml-3 font-medium text-slate-700">Browse</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-4 border-b border-slate-50 active:bg-slate-50"
              onPress={() => {
                setMenuVisible(false);
                router.push('../settings');
              }}
            >
              <SettingsIcon size={20} color="#64748B" />
              <Text className="ml-3 font-medium text-slate-700">Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-4 active:bg-red-50"
              onPress={() => {
                setMenuVisible(false);
                setLogoutModalVisible(true);
              }}
            >
              <Power size={20} color="#EF4444" />
              <Text className="ml-3 font-medium text-red-500">Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal visible={logoutModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <View className="items-center mb-6">
              <View className="bg-red-50 p-4 rounded-full mb-4">
                <Power size={32} color="#EF4444" />
              </View>
              <Text className="text-xl font-bold text-slate-800 mb-2">
                Are you sure?
              </Text>
              <Text className="text-slate-500 text-center">
                You will need to log back in to access your matches.
              </Text>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 h-12 rounded-xl items-center justify-center bg-slate-100"
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text className="font-semibold text-slate-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 h-12 rounded-xl items-center justify-center bg-red-500"
                onPress={handleLogoutConfirm}
              >
                <Text className="font-semibold text-white">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}
