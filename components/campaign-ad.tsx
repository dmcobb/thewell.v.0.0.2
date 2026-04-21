import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { Image } from 'expo-image';
import {
  Building,
  Phone,
  Globe,
  Star,
  ExternalLink,
} from 'lucide-react-native';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { adService, type CampaignAd } from '@/lib/services/ad.service';

interface CampaignAdProps {
  ad: CampaignAd;
  onImpression?: (adId: string) => void;
  onClick?: (adId: string) => void;
}

export function CampaignAd({ ad, onImpression, onClick }: CampaignAdProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Track impression when component mounts
    onImpression?.(ad.id);
  }, [ad.id, onImpression]);

  const handlePress = () => {
    onClick?.(ad.id);
  };

  const handleWebsite = async () => {
    if (ad.website) {
      try {
        await Linking.openURL(ad.website);
        adService.trackClick(ad.id);
      } catch (error) {
        console.error('[CampaignAd] Error opening website:', error);
        Alert.alert('Error', 'Could not open website');
      }
    }
  };

  const handlePhone = async () => {
    if (ad.phone) {
      try {
        await Linking.openURL(`tel:${ad.phone}`);
        adService.trackClick(ad.id);
      } catch (error) {
        console.error('[CampaignAd] Error opening phone:', error);
        Alert.alert('Error', 'Could not make phone call');
      }
    }
  };

  const handleCTA = () => {
    if (ad.ctaUrl) {
      Linking.openURL(ad.ctaUrl).catch((error) => {
        console.error('[CampaignAd] Error opening CTA URL:', error);
        Alert.alert('Error', 'Could not open link');
      });
      adService.trackClick(ad.id);
    } else {
      handlePress();
    }
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
            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
              <Text className="text-white text-xs font-medium">Campaign</Text>
            </Badge>
          </View>
          <View className="absolute top-2 left-2">
            <Badge className="bg-white/90 border-blue-200">
              <View className="flex-row items-center gap-1">
                <Star size={12} color="#0891B2" />
                <Text className="text-blue-600 text-xs font-medium">Sponsored</Text>
              </View>
            </Badge>
          </View>
        </View>

        <CardContent className="p-4">
          <View className="mb-3">
            <Text className="text-lg font-bold text-slate-800 mb-1" numberOfLines={2}>
              {ad.title}
            </Text>
            <Text className="text-sm text-slate-600 mb-2" numberOfLines={3}>
              {ad.description}
            </Text>
            
            <View className="flex-row items-center gap-2 mb-2">
              <Building size={16} color="#0891B2" />
              <Text className="text-sm font-medium text-blue-600">
                {ad.businessName}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2 mb-4">
            {ad.website && (
              <Button
                variant="outline"
                className="flex-1 h-10"
                onPress={handleWebsite}
              >
                <View className="flex-row items-center gap-2">
                  <Globe size={16} color="#0891B2" />
                  <Text className="text-blue-600 font-medium">Website</Text>
                </View>
              </Button>
            )}
            
            {ad.phone && (
              <Button
                variant="outline"
                className="flex-1 h-10"
                onPress={handlePhone}
              >
                <View className="flex-row items-center gap-2">
                  <Phone size={16} color="#0891B2" />
                  <Text className="text-blue-600 font-medium">Call</Text>
                </View>
              </Button>
            )}
          </View>

          {ad.ctaText && (
            <Button
              className="w-full h-10 bg-gradient-to-r from-blue-500 to-cyan-500"
              onPress={handleCTA}
            >
              <View className="flex-row items-center gap-2">
                <ExternalLink size={16} color="white" />
                <Text className="text-white font-medium">{ad.ctaText}</Text>
              </View>
            </Button>
          )}
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
}
