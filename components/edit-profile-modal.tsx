import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { X, Upload } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { userService } from '@/lib/services/user.service';
import * as ImagePicker from 'expo-image-picker';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function EditProfileModal({
  visible,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
  });
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadProfile();
    }
  }, [visible]);

  const loadProfile = async () => {
    try {
      const userProfile = await userService.getCurrentUser();
      if (userProfile) {
        setProfile({
          first_name: userProfile.first_name || '',
          last_name: userProfile.last_name || '',
        });
        // Set existing photo if available
        if (userProfile.photos && userProfile.photos.length > 0) {
          const primaryPhoto = userProfile.photos.find((p) => p.is_primary);
          setSelectedPhoto(
            primaryPhoto?.photo_url || userProfile.photos[0]?.photo_url || null,
          );
        }
      }
    } catch (err) {
      console.error('[Anointed Innovations] Error loading profile:', err);
    }
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedPhoto(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!profile.first_name.trim() || !profile.last_name.trim()) {
      Alert.alert('Error', 'Please enter both first and last name');
      return;
    }

    try {
      setLoading(true);

      // Update profile name
      await userService.updateProfile({
        first_name: profile.first_name.trim(),
        last_name: profile.last_name.trim(),
      });

      // Upload photo if selected
      if (selectedPhoto && selectedPhoto.startsWith('file://')) {
        await userService.uploadPhotos([{ uri: selectedPhoto }]);
      }

      Alert.alert('Success', 'Your profile has been updated');
      onSave?.();
      onClose();
    } catch (err) {
      console.error('[Anointed Innovations] Error saving profile:', err);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-slate-200">
          <Text className="text-lg font-bold text-slate-800">Edit Profile</Text>
          <Button variant="ghost" size="sm" onPress={onClose}>
            <X size={24} color="#64748B" />
          </Button>
        </View>

        {/* Form */}
        <ScrollView contentContainerClassName="p-4 pb-6">
          <View className="gap-6">
            {/* Photo Section */}
            <View>
              <Text className="text-sm font-medium text-slate-700 mb-3">
                Profile Photo
              </Text>
              <TouchableOpacity
                onPress={pickPhoto}
                className="bg-slate-100 rounded-lg p-4 items-center justify-center"
              >
                {selectedPhoto ? (
                  <Image
                    source={{ uri: selectedPhoto }}
                    className="w-32 h-32 rounded-lg"
                  />
                ) : (
                  <View className="w-32 h-32 rounded-lg bg-slate-200 items-center justify-center">
                    <Upload size={32} color="#94a3b8" />
                  </View>
                )}
              </TouchableOpacity>
              <Text className="text-xs text-slate-500 mt-2 text-center">
                Tap to change photo
              </Text>
            </View>

            {/* First Name */}
            <View>
              <Text className="text-sm font-medium text-slate-700 mb-2">
                First Name
              </Text>
              <TextInput
                value={profile.first_name}
                onChangeText={(text) =>
                  setProfile({ ...profile, first_name: text })
                }
                placeholder="Enter first name"
                className="bg-slate-100 rounded-lg p-3 text-slate-800"
              />
            </View>

            {/* Last Name */}
            <View>
              <Text className="text-sm font-medium text-slate-700 mb-2">
                Last Name
              </Text>
              <TextInput
                value={profile.last_name}
                onChangeText={(text) =>
                  setProfile({ ...profile, last_name: text })
                }
                placeholder="Enter last name"
                className="bg-slate-100 rounded-lg p-3 text-slate-800"
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View className="flex-row gap-3 px-4 py-4 border-t border-slate-200">
          <Button
            variant="outline"
            className="flex-1 h-12 bg-transparent"
            onPress={onClose}
          >
            <Text className="text-slate-600 font-medium">Cancel</Text>
          </Button>
          <Button
            className="flex-1 h-12"
            onPress={handleSave}
            disabled={loading}
          >
            <Text className="text-white font-medium">
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
}
