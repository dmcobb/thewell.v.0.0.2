import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import {
  Calendar,
  MapPin,
  Users,
  Heart,
  Star,
  ExternalLink,
} from 'lucide-react-native';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { adService, type EventAd } from '@/lib/services/ad.service';

interface EventAdProps {
  ad: EventAd;
  onImpression?: (adId: string) => void;
  onClick?: (adId: string) => void;
}

export function EventAd({ ad, onImpression, onClick }: EventAdProps) {
  const [isAttending, setIsAttending] = useState(ad.isAttending || false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Track impression when component mounts
    onImpression?.(ad.id);
  }, [ad.id, onImpression]);

  const handleRSVP = async (attending: boolean) => {
    setLoading(true);
    try {
      const result = await adService.rsvpEventAd(ad.id, attending);
      if (result.success) {
        setIsAttending(attending);
        Alert.alert(
          'Success',
          attending ? 'You are now attending this event!' : 'You are no longer attending this event.'
        );
      } else {
        Alert.alert('Error', 'Failed to update your RSVP status');
      }
    } catch (error) {
      console.error('[EventAd] RSVP error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    onClick?.(ad.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <Card className="mb-4 overflow-hidden shadow-lg bg-white/95">
        <View className="relative">
          {ad.imageUrl && (
            <Image
              source={{ uri: ad.imageUrl }}
              className="w-full h-48"
              contentFit="cover"
            />
          )}
          <View className="absolute top-2 right-2">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Text className="text-white text-xs font-medium">Event</Text>
            </Badge>
          </View>
          <View className="absolute top-2 left-2">
            <Badge className="bg-white/90 border-purple-200">
              <View className="flex-row items-center gap-1">
                <Star size={12} color="#8B5CF6" />
                <Text className="text-purple-600 text-xs font-medium">Sponsored</Text>
              </View>
            </Badge>
          </View>
        </View>

        <CardContent className="p-4">
          <View className="mb-3">
            <Text className="text-lg font-bold text-slate-800 mb-1" numberOfLines={2}>
              {ad.eventTitle}
            </Text>
            <Text className="text-sm text-slate-600 mb-2" numberOfLines={3}>
              {ad.description}
            </Text>
            
            {ad.businessName && (
              <Text className="text-xs text-purple-600 font-medium mb-2">
                Hosted by {ad.businessName}
              </Text>
            )}
          </View>

          <View className="gap-2 mb-4">
            <View className="flex-row items-center gap-2">
              <Calendar size={16} color="#64748b" />
              <Text className="text-sm text-slate-600">
                {formatDate(ad.eventStartTime)}
              </Text>
            </View>
            
            {ad.location && (
              <View className="flex-row items-center gap-2">
                <MapPin size={16} color="#64748b" />
                <Text className="text-sm text-slate-600" numberOfLines={1}>
                  {ad.location}
                </Text>
              </View>
            )}
            
            {ad.attendeeCount !== undefined && (
              <View className="flex-row items-center gap-2">
                <Users size={16} color="#64748b" />
                <Text className="text-sm text-slate-600">
                  {ad.attendeeCount} attending
                  {ad.maxAttendees && ` / ${ad.maxAttendees}`}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row gap-2">
            <Button
              variant={isAttending ? "default" : "outline"}
              className={`flex-1 h-10 ${isAttending ? 'bg-green-500' : ''}`}
              onPress={() => handleRSVP(true)}
              disabled={loading}
            >
              <View className="flex-row items-center gap-2">
                <Heart size={16} color={isAttending ? "white" : "#8B5CF6"} />
                <Text className={`font-medium ${isAttending ? 'text-white' : 'text-purple-600'}`}>
                  {isAttending ? 'Going' : 'Interested'}
                </Text>
              </View>
            </Button>
            
            <Button
              variant="outline"
              className="flex-1 h-10"
              onPress={() => handleRSVP(false)}
              disabled={loading || !isAttending}
            >
              <Text className="text-slate-600 font-medium">Maybe</Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
}
