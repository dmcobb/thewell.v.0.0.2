import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Play, Shield, LogOut } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { VideoPlayer } from '@/components/video-player';
import { useAuth } from '@/contexts/auth-context';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { userService } from '@/lib/services/user.service';

export default function ProfileTab() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const currentProfile = await userService.getCurrentUser();
      setProfile(currentProfile);
    } catch (error) {
      console.error('[Anointed Innovations] Error loading profile:', error);
      // We don't setProfile(user) here; we handle the fallback in the render logic to avoid circularity
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Fallback to auth context user if the local profile state hasn't loaded yet
  const displayUser = profile || user;

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="text-slate-500 mt-2">Loading your profile...</Text>
      </View>
    );
  }

  // SANITIZATION: Extract primitives to prevent NativeWind from crashing on complex objects
  const firstName = String(displayUser?.first_name || 'User');
  const lastName = String(displayUser?.last_name || '');
  const denomination = String(displayUser?.denomination || 'Christian');
  const age = displayUser?.date_of_birth
    ? calculateAge(displayUser.date_of_birth)
    : null;
  const isVerified = Boolean(displayUser?.is_verified);
  const videoUrl = displayUser?.profile_video_url
    ? String(displayUser.profile_video_url)
    : null;
  const thumbnail = displayUser?.profile_video_thumbnail_url
    ? String(displayUser.profile_video_thumbnail_url)
    : null;

  const primaryPhoto =
    displayUser?.photos?.find((p: any) => p.is_primary)?.photo_url ||
    displayUser?.photos?.[0]?.photo_url ||
    null;

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-6">
        <View className="gap-6">
          <Card className="shadow-lg bg-white">
            <CardContent className="p-6 items-center">
              <Avatar className="w-24 h-24 mb-4">
                {primaryPhoto && <AvatarImage source={{ uri: primaryPhoto }} />}
                <AvatarFallback className="bg-purple-500">
                  <Text className="text-white text-2xl font-semibold">
                    {firstName[0]}
                  </Text>
                </AvatarFallback>
              </Avatar>
              <Text className="text-xl font-semibold text-slate-800">
                {firstName} {lastName}
              </Text>
              <Text className="text-slate-600 mt-1">
                {denomination} {age ? `• ${age} years old` : ''}
              </Text>

              <Badge className="mt-3 bg-purple-50">
                <View className="flex-row items-center gap-1">
                  <Shield size={12} color="#8B5CF6" />
                  <Text className="text-xs text-purple-500 font-medium">
                    {isVerified ? 'Verified Soul' : 'Unverified'}
                  </Text>
                </View>
              </Badge>

              <Button
                variant="outline"
                className="w-full mt-4"
                onPress={() => router.push('../settings')}
              >
                <Text className="text-primary font-medium">Edit Account</Text>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-white">
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <Play size={20} color="#8B5CF6" />
                <CardTitle className="text-purple-500">
                  Your Story Flows
                </CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              {videoUrl ? (
                <View className="aspect-video rounded-xl overflow-hidden mb-4 bg-slate-100">
                  <VideoPlayer
                    videoUrl={videoUrl}
                    poster={thumbnail || primaryPhoto || ''}
                    className="h-full"
                  />
                </View>
              ) : (
                <View className="aspect-video rounded-xl overflow-hidden mb-4 bg-slate-200 items-center justify-center">
                  <Play size={48} color="#8B5CF6" />
                </View>
              )}
              <Button
                variant="outline"
                className="w-full h-12"
                onPress={() => router.push('../profile/video')}
              >
                <Text className="text-purple-500 font-medium">
                  {videoUrl ? 'Update Your Story' : 'Record Your Story'}
                </Text>
              </Button>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full h-12 border-red-200 bg-red-50"
            onPress={handleLogout}
          >
            <View className="flex-row items-center gap-2">
              <LogOut size={18} color="#DC2626" />
              <Text className="text-red-600 font-medium">Logout</Text>
            </View>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
