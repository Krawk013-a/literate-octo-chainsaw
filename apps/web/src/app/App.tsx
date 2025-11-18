import { PropsWithChildren, useEffect } from 'react';
import AppRouter from './router';
import { AppProviders } from './providers/AppProviders';
import { realtimeClient } from '@/services/realtime/realtimeClient';

const RealtimeGateway = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    realtimeClient.connect();
    return () => realtimeClient.disconnect();
  }, []);

  return children;
};

const App = () => (
  <AppProviders>
    <RealtimeGateway>
      <AppRouter />
    </RealtimeGateway>
  </AppProviders>
);

export default App;
