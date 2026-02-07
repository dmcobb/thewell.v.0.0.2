import { View, Text, Animated } from 'react-native';
import { useNotification } from '@/contexts/notification-context';
import { X } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

export function NotificationContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { notifications, removeNotification } = useNotification();

  return (
    <View className="flex-1">
      {children}

      {notifications.map((notification, index) => (
        <Animated.View
          key={notification.id}
          className="absolute top-0 left-0 right-0 z-50"
          style={{
            transform: [
              {
                translateY: 20 + index * 80,
              },
            ],
          }}
        >
          <View className="mx-4 mt-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg flex-row items-start gap-3">
            <View className="flex-1">
              <Text className="text-white font-semibold text-sm">
                {notification.title}
              </Text>
              <Text className="text-purple-100 text-xs mt-1">
                {notification.message}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => removeNotification(notification.id)}
            >
              <X size={18} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}
