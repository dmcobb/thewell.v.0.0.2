import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons'; // Added for the tooltip icon
import { userService } from '../lib/services/user.service';
import { useAuth } from '../contexts/auth-context';
import { EquallyYokedQuestionnaire } from '../components/equally-yoked-questionnaire';
import { ProfileImagePicker } from '@/components/ui/ProfileImagePicker';
import type { QuestionnaireResponse } from '../lib/services/user.service';

export default function StartJourneyScreen() {
  const router = useRouter();
  const { user, logout, onboardingProgress, refreshUser } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return cleaned;
    if (!match[2]) return match[1];
    return `(${match[1]}) ${match[2]}${match[3] ? '-' + match[3] : ''}`;
  };

  const [profileData, setProfileData] = useState({
    gender: '',
    locationCity: '',
    locationState: '',
    phoneNumber: '',
    profileImage: null as string | null,
  });

  const [questionnaireResponses, setQuestionnaireResponses] = useState<
    QuestionnaireResponse[]
  >([]);

  const [preferences, setPreferences] = useState({
    lookingFor: '',
    denomination: '',
    sameDenomination: false,
    churchAttendance: '',
    location: '',
    ageRangeMin: '25',
    ageRangeMax: '35',
    racePreference: '' as string,
    maxDistance: '50',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);

    return () => clearTimeout(timer);
  }, [step, contentHeight]);

  useEffect(() => {
    if (onboardingProgress) {
      setStep(onboardingProgress.currentStep || 1);
      if (onboardingProgress.basicInfo) {
        setProfileData(onboardingProgress.basicInfo);
      }
      if (onboardingProgress.questionnaireResponses) {
        setQuestionnaireResponses(onboardingProgress.questionnaireResponses);
      }
      if (onboardingProgress.preferences) {
        setPreferences({
          lookingFor: onboardingProgress.preferences.lookingFor || '',
          denomination: onboardingProgress.preferences.denomination || '',
          sameDenomination:
            onboardingProgress.preferences.sameDenomination ?? false,
          churchAttendance:
            onboardingProgress.preferences.churchAttendance || '',
          location: onboardingProgress.preferences.location || '',
          ageRangeMin:
            onboardingProgress.preferences.ageRange?.min?.toString() || '25',
          ageRangeMax:
            onboardingProgress.preferences.ageRange?.max?.toString() || '35',
          racePreference: onboardingProgress.preferences.racePreference || '',
          maxDistance:
            onboardingProgress.preferences.maxDistance?.toString() || '50',
        });
      }
    }
  }, [onboardingProgress]);

  useEffect(() => {
    const saveProgress = async () => {
      if (step > 0 && step < 4 && !user?.profileComplete) {
        await saveOnboardingProgress();
      }
    };
    const debounceTimer = setTimeout(saveProgress, 2000);
    return () => clearTimeout(debounceTimer);
  }, [profileData, preferences, step]);

  const saveOnboardingProgress = async () => {
    try {
      setIsSaving(true);
      await userService.saveOnboardingProgress({
        currentStep: step,
        basicInfo: profileData,
        questionnaireResponses:
          questionnaireResponses.length > 0
            ? questionnaireResponses
            : undefined,
        preferences:
          step >= 3
            ? {
                lookingFor: preferences.lookingFor,
                denomination: preferences.denomination,
                sameDenomination: preferences.sameDenomination,
                churchAttendance: preferences.churchAttendance,
                location: preferences.location,
                ageRange: {
                  min: Number.parseInt(preferences.ageRangeMin),
                  max: Number.parseInt(preferences.ageRangeMax),
                },
                racePreference: preferences.racePreference,
                maxDistance: Number.parseInt(preferences.maxDistance),
              }
            : undefined,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Save Progress & Logout',
      'Your progress will be saved. You can continue where you left off when you return.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await saveOnboardingProgress();
            await logout();
          },
        },
      ],
    );
  };

  const handleQuestionnaireComplete = useCallback(
    async (responses: QuestionnaireResponse[]) => {
      setQuestionnaireResponses(responses);
      setStep(3); // Fixed: Sequence should go to Preferences (3) before Final (4)
      await saveOnboardingProgress();
    },
    [],
  );

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const { authService } = await import('../lib/services/auth.service');

      await authService.updateCurrentUser({
        phone_number: profileData.phoneNumber,
        profileComplete: true,
      } as any);

      await userService.updateProfile({
        gender: profileData.gender.toLowerCase(),
        location_city: profileData.locationCity,
        location_state: profileData.locationState,
        denomination: preferences.denomination,
        church_attendance_frequency: preferences.churchAttendance,
        profileComplete: true,
      });

      await userService.updatePreferences({
        lookingFor: preferences.lookingFor,
        denomination: preferences.denomination,
        sameDenomination: preferences.sameDenomination,
        churchAttendance: preferences.churchAttendance,
        location: preferences.location,
        ageRange: {
          min: Number.parseInt(preferences.ageRangeMin),
          max: Number.parseInt(preferences.ageRangeMax),
        },
        racePreference: preferences.racePreference,
        maxDistance: Number.parseInt(preferences.maxDistance),
      });

      if (profileData.profileImage) {
        await userService.setPrimaryPhoto(profileData.profileImage);
      }

      await userService.clearOnboardingProgress();
      await refreshUser();

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBasicInfoComplete = async () => {
    if (
      !profileData.gender ||
      !profileData.locationCity ||
      !profileData.locationState
    ) {
      Alert.alert('Missing Information', 'Please complete all required fields');
      return;
    }
    setStep(2);
    await saveOnboardingProgress();
  };

  const handlePreferencesComplete = () => {
    if (
      !preferences.lookingFor ||
      !preferences.denomination ||
      !preferences.churchAttendance
    ) {
      Alert.alert('Missing Information', 'Please complete all required fields');
      return;
    }
    setStep(4);
  };

  return (
    <LinearGradient colors={['#E0F2FE', '#F0F9FF']} className="flex-1">
      <ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        onContentSizeChange={(w, h) => setContentHeight(h)}
        className="flex-1"
        contentContainerClassName="px-6 py-12"
      >
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-foreground mb-2">
                {step === 1
                  ? 'Basic Information'
                  : step === 2
                    ? 'Equally Yoked Questionnaire'
                    : step === 3
                      ? 'Your Preferences'
                      : 'Final Steps'}
              </Text>
              <Text className="text-base text-muted-foreground">
                {step === 1
                  ? 'Tell us a bit about yourself'
                  : step === 2
                    ? 'Help us understand your faith and values'
                    : step === 3
                      ? 'Help us find your perfect match'
                      : 'Add your contact info and photo'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              className="ml-4 p-3 bg-white rounded-full shadow-sm border border-slate-200"
            >
              <LogOut size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
          {isSaving && (
            <Text className="text-xs text-muted-foreground italic">
              Saving progress...
            </Text>
          )}
        </View>

        <View className="flex-row items-center mb-8">
          <View
            className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-primary/30'}`}
          />
          <View
            className={`flex-1 h-2 rounded-full ml-2 ${step >= 2 ? 'bg-primary' : 'bg-primary/30'}`}
          />
          <View
            className={`flex-1 h-2 rounded-full ml-2 ${step >= 3 ? 'bg-primary' : 'bg-primary/30'}`}
          />
          <View
            className={`flex-1 h-2 rounded-full ml-2 ${step >= 4 ? 'bg-primary' : 'bg-primary/30'}`}
          />
        </View>

        {step === 1 && (
          <View className="gap-6">
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Gender
              </Text>
              <View className="gap-3">
                {['Male', 'Female'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() =>
                      setProfileData({ ...profileData, gender: option })
                    }
                    className={`border-2 rounded-xl py-4 px-4 ${
                      profileData.gender === option
                        ? 'border-primary bg-primary/10'
                        : 'border-input bg-card'
                    }`}
                  >
                    <Text
                      className={`font-medium ${profileData.gender === option ? 'text-primary' : 'text-foreground'}`}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                City
              </Text>
              <TextInput
                value={profileData.locationCity}
                onChangeText={(text) =>
                  setProfileData({ ...profileData, locationCity: text })
                }
                placeholder="e.g., Atlanta"
                className="bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                State
              </Text>
              <TextInput
                value={profileData.locationState}
                onChangeText={(text) =>
                  setProfileData({ ...profileData, locationState: text })
                }
                placeholder="e.g., GA"
                className="bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground"
              />
            </View>

            <TouchableOpacity
              onPress={handleBasicInfoComplete}
              disabled={
                !profileData.gender ||
                !profileData.locationCity ||
                !profileData.locationState
              }
              className={`bg-secondary rounded-xl py-4 px-6 shadow-lg ${
                !profileData.gender ||
                !profileData.locationCity ||
                !profileData.locationState
                  ? 'opacity-50'
                  : ''
              }`}
            >
              <Text className="text-primary-foreground text-center text-lg font-semibold">
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            {/* Tooltip for Older Generation */}
            <View style={{ backgroundColor: '#F0F9FF', borderWidth: 1, borderColor: '#BAE6FD', borderRadius: 12, padding: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="information-circle" size={24} color="#0369A1" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#0369A1', fontWeight: 'bold', fontSize: 14 }}>Quick Tip:</Text>
                <Text style={{ color: '#0369A1', fontSize: 14, lineHeight: 20 }}>
                  Tap the option that fits you best. The box will turn <Text style={{ fontWeight: 'bold', color: '#9B7EDE' }}>Purple</Text> to show it's selected.
                </Text>
              </View>
            </View>
            
            <EquallyYokedQuestionnaire onComplete={handleQuestionnaireComplete} />
          </View>
        )}

        {step === 3 && (
          <View className="gap-6">
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                What are you looking for?
              </Text>
              <View className="gap-3">
                {['Serious Relationship', 'Marriage', 'Friendship First'].map(
                  (option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() =>
                        setPreferences({ ...preferences, lookingFor: option })
                      }
                      className={`border-2 rounded-xl py-4 px-4 ${
                        preferences.lookingFor === option
                          ? 'border-primary bg-primary/10'
                          : 'border-input bg-card'
                      }`}
                    >
                      <Text
                        className={`font-medium ${preferences.lookingFor === option ? 'text-primary' : 'text-foreground'}`}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Your Denomination
              </Text>
              <View className="gap-3">
                {[
                  'Non-Denominational',
                  'Baptist',
                  'Pentecostal',
                  'Methodist',
                  'Catholic',
                  'Other',
                ].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() =>
                      setPreferences({ ...preferences, denomination: option })
                    }
                    className={`border-2 rounded-xl py-4 px-4 ${
                      preferences.denomination === option
                        ? 'border-primary bg-primary/10'
                        : 'border-input bg-card'
                    }`}
                  >
                    <Text
                      className={`font-medium ${preferences.denomination === option ? 'text-primary' : 'text-foreground'}`}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Do you prefer the same denomination?
              </Text>
              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={() =>
                    setPreferences({ ...preferences, sameDenomination: true })
                  }
                  className={`flex-1 border-2 rounded-xl py-4 px-4 ${
                    preferences.sameDenomination === true
                      ? 'border-primary bg-primary/10'
                      : 'border-input bg-card'
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${preferences.sameDenomination === true ? 'text-primary' : 'text-foreground'}`}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    setPreferences({ ...preferences, sameDenomination: false })
                  }
                  className={`flex-1 border-2 rounded-xl py-4 px-4 ${
                    preferences.sameDenomination === false
                      ? 'border-primary bg-primary/10'
                      : 'border-input bg-card'
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${preferences.sameDenomination === false ? 'text-primary' : 'text-foreground'}`}
                  >
                    No Preference
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Church Attendance
              </Text>
              <View className="gap-3">
                {['Weekly', 'Bi-Weekly', 'Monthly', 'Occasionally'].map(
                  (option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() =>
                        setPreferences({
                          ...preferences,
                          churchAttendance: option,
                        })
                      }
                      className={`border-2 rounded-xl py-4 px-4 ${
                        preferences.churchAttendance === option
                          ? 'border-primary bg-primary/10'
                          : 'border-input bg-card'
                      }`}
                    >
                      <Text
                        className={`font-medium ${preferences.churchAttendance === option ? 'text-primary' : 'text-foreground'}`}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Your Location (City, State)
              </Text>
              <TextInput
                value={preferences.location}
                onChangeText={(text) =>
                  setPreferences({ ...preferences, location: text })
                }
                placeholder="e.g., Atlanta, GA"
                className="bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Preferred Age Range
              </Text>
              <View className="flex-row gap-4 items-center">
                <TextInput
                  value={preferences.ageRangeMin}
                  onChangeText={(text) =>
                    setPreferences({ ...preferences, ageRangeMin: text })
                  }
                  placeholder="Min"
                  keyboardType="number-pad"
                  className="flex-1 bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground"
                />
                <Text className="text-muted-foreground">to</Text>
                <TextInput
                  value={preferences.ageRangeMax}
                  onChangeText={(text) =>
                    setPreferences({ ...preferences, ageRangeMax: text })
                  }
                  placeholder="Max"
                  keyboardType="number-pad"
                  className="flex-1 bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground"
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Race/Ethnicity Preference
              </Text>
              <View className="gap-3">
                {[
                  'No Preference',
                  'Black/African American',
                  'White/Caucasian',
                  'Hispanic/Latino',
                  'Asian',
                  'Mixed/Other',
                ].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() =>
                      setPreferences({ ...preferences, racePreference: option })
                    }
                    className={`border-2 rounded-xl py-4 px-4 ${
                      preferences.racePreference === option
                        ? 'border-primary bg-primary/10'
                        : 'border-input bg-card'
                    }`}
                  >
                    <Text
                      className={`font-medium ${preferences.racePreference === option ? 'text-primary' : 'text-foreground'}`}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Maximum Distance (miles)
              </Text>
              <TextInput
                value={preferences.maxDistance}
                onChangeText={(text) =>
                  setPreferences({ ...preferences, maxDistance: text })
                }
                placeholder="50"
                keyboardType="number-pad"
                className="bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground"
              />
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setStep(2)}
                className="flex-1 border-2 border-primary rounded-xl py-4 px-6"
              >
                <Text className="text-primary text-center text-lg font-semibold">
                  Back
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePreferencesComplete}
                className="flex-1 bg-secondary rounded-xl py-4 px-6 shadow-lg"
              >
                <Text className="text-primary-foreground text-center text-lg font-semibold">
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 4 && (
          <View className="gap-6">
            <View className="items-center mb-4">
              <ProfileImagePicker
                imageUri={profileData.profileImage}
                onImageSelected={(uri) =>
                  setProfileData({ ...profileData, profileImage: uri })
                }
              />
              <Text className="text-xs text-muted-foreground mt-2 italic">
                Optional: You can skip this for now
              </Text>
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Phone Number
              </Text>
              <TextInput
                value={profileData.phoneNumber}
                onChangeText={(text) =>
                  setProfileData({
                    ...profileData,
                    phoneNumber: formatPhoneNumber(text),
                  })
                }
                placeholder="(555) 555-5555"
                keyboardType="phone-pad"
                maxLength={14}
                className="bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground"
              />
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setStep(3)}
                className="flex-1 border-2 border-primary rounded-xl py-4 px-6"
              >
                <Text className="text-primary text-center text-lg font-semibold">
                  Back
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleComplete}
                disabled={isLoading || !profileData.phoneNumber}
                className={`flex-1 bg-secondary rounded-xl py-4 px-6 shadow-lg ${isLoading || !profileData.phoneNumber ? 'opacity-50' : ''}`}
              >
                <Text className="text-primary-foreground text-center text-lg font-semibold">
                  {isLoading ? 'Saving...' : 'Complete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}