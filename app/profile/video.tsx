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
      // Load existing video from user profile context
      if (user?.profile_video_url) {
        setExistingVideoUrl(user.profile_video_url);
      } else {
        console.error(
          '[DEBUG] loadExistingVideo: No existing video URL found on user profile',
        );
      }
    } catch (error) {
      console.error(
        '[Anointed Innovations] Error loading existing video:',
        error,
      );
      console.error(
        '[DEBUG] loadExistingVideo: Error details:',
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  /**
   * HANDLER: Triggered by VideoRecorder component
   * uri: string (Upload pressed) | null (Cancel pressed)
   */
  const handleVideoRecorded = (uri: string | null) => {
    if (uri === null) {
      // User clicked 'Cancel' - restore view to original state
      setRecordedVideoUri(null);
      setUploadSuccess(false);
      loadExistingVideo();
      return;
    }

    // User clicked 'Upload Video Profile' in the recorder
    setRecordedVideoUri(uri);
    setUploadSuccess(false);

    // Automatically start the upload process once the user hits "Upload" in recorder
    handleUploadVideo(uri);
  };

  const handleUploadVideo = async (uriOverride?: string) => {
    const videoToUpload = uriOverride || recordedVideoUri;

    if (!videoToUpload) {
      console.error('[DEBUG] handleUploadVideo: No video URI available');
      Alert.alert('Error', 'No video to upload');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Initial progress simulation
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

      // Update state with new video
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
      console.error('[Anointed Innovations] Upload error:', error);
      console.error(
        '[DEBUG] handleUploadVideo: Error message:',
        error.message || error,
      );
      console.error('[DEBUG] handleUploadVideo: Full error:', error);
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
              console.error('[Anointed Innovations] Delete error:', error);
              console.error(
                '[DEBUG] handleDeleteVideo: Error details:',
                error.message,
              );
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
    <View className="flex-1 bg-white">
      <LinearGradient
        colors={['#0891B2', '#8B5CF6', '#0284C7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="pt-12 pb-6 px-4"
      >
        <View className="flex-row items-center gap-3 mb-2">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white flex-1">
            Video Profile
          </Text>
        </View>
        <Text className="text-white/90 text-sm">
          Share your story and let your personality shine
        </Text>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-4">
        {/* Existing Video Section */}
        {existingVideoUrl && !recordedVideoUri && !isUploading && (
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-semibold text-slate-800">
                  Current Video Profile
                </Text>
                <Button
                  onPress={handleDeleteVideo}
                  variant="outline"
                  size="sm"
                  disabled={isDeleting}
                  className="bg-transparent border-red-200"
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <View className="flex-row items-center gap-2">
                      <Trash2 size={14} color="#EF4444" />
                      <Text className="text-red-500 text-xs font-medium">
                        Delete
                      </Text>
                    </View>
                  )}
                </Button>
              </View>

              <View className="bg-black rounded-xl overflow-hidden aspect-video">
                <VideoView
                  player={player}
                  style={{ width: '100%', height: '100%' }}
                  allowsFullscreen
                  allowsPictureInPicture
                  nativeControls
                />
              </View>

              <View className="mt-3 p-3 bg-gradient-to-r from-ocean-50 via-purple-50 to-ocean-50 border border-purple-200/50 rounded-xl flex-row items-center gap-2">
                <CheckCircle size={16} color="#8B5CF6" />
                <Text className="text-sm text-purple-500 font-medium">
                  Your video is live on your profile
                </Text>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Recording Instructions */}
        {!recordedVideoUri && !existingVideoUrl && !isUploading && (
          <Card className="shadow-lg border-2 border-purple-200/50">
            <CardContent className="p-4">
              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 bg-linear-to-br from-ocean-400 to-purple-500 rounded-full items-center justify-center">
                  <Play size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-slate-800 mb-2">
                    Tips for a Great Video
                  </Text>
                  <View className="gap-2">
                    <Text className="text-sm text-slate-600">
                      • Find good lighting and a quiet space
                    </Text>
                    <Text className="text-sm text-slate-600">
                      • Share what makes you unique
                    </Text>
                    <Text className="text-sm text-slate-600">
                      • Be authentic and smile!
                    </Text>
                    <Text className="text-sm text-slate-600">
                      • Keep it under 60 seconds
                    </Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Video Recorder - Hidden during active upload or if successful */}
        {!existingVideoUrl && !isUploading && !uploadSuccess && (
          <VideoRecorder
            onVideoRecorded={handleVideoRecorded}
            maxDuration={60}
          />
        )}

        {/* Upload Progress Display */}
        {isUploading && (
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <View className="items-center gap-3">
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="text-base font-semibold text-slate-800">
                  Uploading Your Video...
                </Text>
                <Progress value={uploadProgress} className="w-full h-3" />
                <Text className="text-sm text-slate-600">
                  {Math.round(uploadProgress)}% complete
                </Text>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Success Feedback Display */}
        {uploadSuccess && (
          <Card className="shadow-lg border-2 border-green-200">
            <CardContent className="p-4">
              <View className="items-center gap-3">
                <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center">
                  <CheckCircle size={32} color="#10B981" />
                </View>
                <Text className="text-lg font-bold text-slate-800">
                  Upload Successful!
                </Text>
                <Text className="text-sm text-slate-600 text-center">
                  Your video profile is now live and visible to potential
                  matches
                </Text>
                <Button
                  onPress={() => setUploadSuccess(false)}
                  variant="outline"
                  className="mt-2"
                >
                  <Text>Dismiss</Text>
                </Button>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Replace Video Option (When viewing existing video) */}
        {existingVideoUrl && !recordedVideoUri && !isUploading && (
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <Text className="text-base font-semibold text-slate-800 mb-3">
                Want to update your video?
              </Text>
              <Button
                onPress={() => setExistingVideoUrl(null)}
                variant="outline"
                className="bg-transparent border-purple-200"
              >
                <View className="flex-row items-center gap-2">
                  <Upload size={16} color="#8B5CF6" />
                  <Text className="text-purple-500 font-medium">
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
