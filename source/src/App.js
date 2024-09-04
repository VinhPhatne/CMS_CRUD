import React from 'react';

import Loading from '@components/common/loading';
import AppLoading from '@modules/main/AppLoading';
import AppRoutes from '@routes/routes';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(utc);
dayjs.extend(localizedFormat);

const App = () => (
    <React.Suspense fallback={<Loading show />}>
        <AppLoading />
        <AppRoutes />
    </React.Suspense>
);

export default App;
