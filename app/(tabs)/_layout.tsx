import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function Icon({ label }: { label: string }) {
  return <Text style={{ fontSize: 20 }}>{label}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1c1c24', borderTopColor: '#2a2a38' },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Log', tabBarIcon: ({ color }) => <Icon label="📋" /> }}
      />
      <Tabs.Screen
        name="graphs"
        options={{ title: 'Graphs', tabBarIcon: ({ color }) => <Icon label="📈" /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: ({ color }) => <Icon label="⚙️" /> }}
      />
    </Tabs>
  );
}
