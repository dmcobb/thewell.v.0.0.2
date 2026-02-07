import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../lib/services/auth.service';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      Alert.alert('Error', 'Invalid or missing reset token');
      router.push('/auth/login');
    }
  }, [token]);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword(
        token as string,
        newPassword,
      );
      Alert.alert(
        'Success',
        'Your password has been reset successfully. Please log in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/auth/login'),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to reset password. The link may have expired.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#E0F2FE', '#F0F9FF']} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-12">
        <TouchableOpacity
          onPress={() => router.push('/auth/login')}
          className="mb-8"
        >
          <Ionicons name="arrow-back" size={28} color="#0891B2" />
        </TouchableOpacity>

        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Reset Password
          </Text>
          <Text className="text-base text-muted-foreground">
            Enter your new password below
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">
            New Password
          </Text>
          <View className="relative">
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              className="bg-card border border-input rounded-xl px-4 py-3 pr-12 text-base text-foreground"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3"
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-muted-foreground mt-1">
            Must be at least 8 characters
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-foreground mb-2">
            Confirm Password
          </Text>
          <View className="relative">
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              className="bg-card border border-input rounded-xl px-4 py-3 pr-12 text-base text-foreground"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-3"
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={24}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleResetPassword}
          disabled={isLoading}
          className={`bg-primary rounded-xl py-4 px-6 shadow-lg ${isLoading ? 'opacity-50' : ''}`}
        >
          <Text className="text-primary-foreground text-center text-lg font-semibold">
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}
