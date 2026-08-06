import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@workspace/feelfed-ds/components/ui/toaster';
import { TooltipProvider } from '@workspace/feelfed-ds/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { PhoneShell } from '@/components/phone-shell';
import TodayPage from '@/pages/today';
import HistoryPage from '@/pages/history';
import TrendsPage from '@/pages/trends';
import YouPage from '@/pages/you';
import CheckinBeforePage from '@/pages/checkin-before';
import CheckinDuringPage from '@/pages/checkin-during';
import CheckinAfterPage from '@/pages/checkin-after';
import FollowUpPage from '@/pages/followup';
import MovementNewPage from '@/pages/movement-new';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={TodayPage} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/trends" component={TrendsPage} />
      <Route path="/you" component={YouPage} />
      <Route path="/checkin/before" component={CheckinBeforePage} />
      <Route path="/checkin/during" component={CheckinDuringPage} />
      <Route path="/checkin/after" component={CheckinAfterPage} />
      <Route path="/followup/:id" component={FollowUpPage} />
      <Route path="/movement/new" component={MovementNewPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <PhoneShell>
            <Router />
          </PhoneShell>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
