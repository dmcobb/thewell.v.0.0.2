import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
  ArrowLeft,
  Trash2,
  Upload,
  CheckCircle,
  Play,
} from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { VideoRecorder } from '@/components/video-recorder';
import { mediaService } from '@/lib/services/media.service';
import { useAuth } from '@/contexts/auth-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileVideoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const player = useVideoPlayer(existingVideoUrl || '', (player) => {
    player.loop = true;
  });

  useEffect(() => {
    loadExistingVideo();
  }, []);

  useEffect(() => {
    if (existingVideoUrl && player) {
      player.replace(existingVideoUrl);
    }
  }, [existingVideoUrl]);

  const loadExistingVideo = async () => {
    try {
      if (user?.profile_video_url) {
        setExistingVideoUrl(user.profile_video_url);
      }
    } catch (error) {
      console.error(
        '[Anointed Innovations] Error loading existing video:',
        error,
      );
    }
  };

  const handleVideoRecorded = (uri: string | null) => {
    if (uri === null) {
      setRecordedVideoUri(null);
      setUploadSuccess(false);
      loadExistingVideo();
      return;
    }
    setRecordedVideoUri(uri);
    setUploadSuccess(false);
    handleUploadVideo(uri);
  };

  const handleUploadVideo = async (uriOverride?: string) => {
    const videoToUpload = uriOverride || recordedVideoUri;

    if (!videoToUpload) {
      Alert.alert('Error', 'No video to upload');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 300);

      const response = await mediaService.uploadProfileVideo(
        videoToUpload,
        (progress) => {
          setUploadProgress(progress);
        },
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      setExistingVideoUrl(response.data.video_url);
      setRecordedVideoUri(null);
      setUploadSuccess(true);

      Alert.alert(
        'Success',
        'Your video profile has been uploaded successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setUploadSuccess(false);
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        'Upload Failed',
        error.message || 'Failed to upload video. Please try again.',
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteVideo = async () => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete your profile video?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await mediaService.deleteProfileVideo();
              setExistingVideoUrl(null);
              setRecordedVideoUri(null);
              Alert.alert('Success', 'Your profile video has been deleted');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete video');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <LinearGradient
        colors={['#9B7EDE', '#8B5CF6', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="py-8 px-6"
      >
        <View className="flex-row items-center gap-4 mb-2">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="bg-white/20 p-2 rounded-full"
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white flex-1">
            Video Profile
          </Text>
        </View>
        <Text className="text-purple-100 text-sm font-medium">
          Share your story and let your personality shine
        </Text>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerClassName="p-5 gap-6">
        {existingVideoUrl && !recordedVideoUri && !isUploading && (
          <Card className="shadow-xl bg-white border-0 rounded-[24px] overflow-hidden">
            <CardContent className="p-5">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-slate-800">
                  Current Video Profile
                </Text>
                <Button
                  onPress={handleDeleteVideo}
                  variant="outline"
                  size="sm"
                  disabled={isDeleting}
                  className="bg-red-50 border-red-100 rounded-xl px-4"
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <View className="flex-row items-center gap-2">
                      <Trash2 size={14} color="#EF4444" />
                      <Text className="text-red-500 text-xs font-bold">
                        Delete
                      </Text>
                    </View>
                  )}
                </Button>
              </View>

              <View className="bg-black rounded-2xl overflow-hidden aspect-video shadow-inner">
                <VideoView
                  player={player}
                  style={{ width: '100%', height: '100%' }}
                  allowsFullscreen
                  allowsPictureInPicture
                  nativeControls
                />
              </View>

              <View className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-2xl flex-row items-center gap-3">
                <CheckCircle size={18} color="#8B5CF6" />
                <Text className="text-sm text-primary font-bold">
                  Your video is live on your profile
                </Text>
              </View>
            </CardContent>
          </Card>
        )}

        {!recordedVideoUri && !existingVideoUrl && !isUploading && (
          <Card className="shadow-xl bg-white border-0 rounded-[24px]">
            <CardContent className="p-6">
              <View className="flex-row items-start gap-4">
                <View className="w-12 h-12 bg-purple-100 rounded-2xl items-center justify-center">
                  <Play size={24} color="#8B5CF6" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-slate-800 mb-2">
                    Tips for a Great Video
                  </Text>
                  <View className="gap-2">
                    <Text className="text-sm text-slate-500 font-medium">
                      • Find good lighting and a quiet space
                    </Text>
                    <Text className="text-sm text-slate-500 font-medium">
                      • Share what makes you unique
                    </Text>
                    <Text className="text-sm text-slate-500 font-medium">
                      • Be authentic and smile!
                    </Text>
                    <Text className="text-sm text-slate-500 font-medium">
                      • Keep it under 60 seconds
                    </Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>
        )}

        {!existingVideoUrl && !isUploading && !uploadSuccess && (
          <View className="rounded-[24px] overflow-hidden shadow-xl">
            <VideoRecorder
              onVideoRecorded={handleVideoRecorded}
              maxDuration={60}
            />
          </View>
        )}

        {isUploading && (
          <Card className="shadow-xl bg-white border-0 rounded-[24px]">
            <CardContent className="p-6">
              <View className="items-center gap-4">
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="text-lg font-bold text-slate-800">
                  Uploading Your Video...
                </Text>
                <Progress value={uploadProgress} className="w-full h-3 bg-slate-100" />
                <Text className="text-sm text-slate-400 font-bold">
                  {Math.round(uploadProgress)}% complete
                </Text>
              </View>
            </CardContent>
          </Card>
        )}

        {uploadSuccess && (
          <Card className="shadow-xl bg-white border-0 rounded-[24px] border-l-4 border-green-500">
            <CardContent className="p-6">
              <View className="items-center gap-4">
                <View className="w-16 h-16 bg-green-50 rounded-full items-center justify-center">
                  <CheckCircle size={32} color="#10B981" />
                </View>
                <Text className="text-xl font-bold text-slate-800">
                  Upload Successful!
                </Text>
                <Text className="text-sm text-slate-500 font-medium text-center leading-relaxed">
                  Your video profile is now live and visible to potential
                  matches
                </Text>
                <Button
                  onPress={() => setUploadSuccess(false)}
                  variant="outline"
                  className="mt-2 border-slate-200 rounded-xl px-8"
                >
                  <Text className="font-bold text-slate-600">Dismiss</Text>
                </Button>
              </View>
            </CardContent>
          </Card>
        )}

        {existingVideoUrl && !recordedVideoUri && !isUploading && (
          <Card className="shadow-xl bg-white border-0 rounded-[24px]">
            <CardContent className="p-5">
              <Text className="text-lg font-bold text-slate-800 mb-4">
                Want to update your video?
              </Text>
              <Button
                onPress={() => setExistingVideoUrl(null)}
                variant="outline"
                className="w-full h-14 bg-purple-50 border-purple-100 rounded-2xl"
              >
                <View className="flex-row items-center gap-2">
                  <Upload size={18} color="#8B5CF6" />
                  <Text className="text-primary font-bold text-lg">
                    Record New Video
                  </Text>
                </View>
              </Button>
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}