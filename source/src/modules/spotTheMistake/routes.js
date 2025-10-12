import GameListPage from './GameListPage';
import GameForm from './GameForm';
import GamePlayPage from './GamePlayPage';
import Demo from './Demo';
import PublicSpotTheMistake from './PublicSpotTheMistake';
import PublicIndex from './PublicIndex';

const routes = {
    gameListPage: {
        path: '/spot-the-mistake',
        component: GameListPage,
        auth: false,
        title: 'Spot the Mistake - Game List',
    },
    gameFormPage: {
        path: '/spot-the-mistake/create',
        component: GameForm,
        auth: false,
        title: 'Create Game',
    },
    gameEditPage: {
        path: '/spot-the-mistake/edit/:id',
        component: GameForm,
        auth: false,
        title: 'Edit Game',
    },
    gamePlayPage: {
        path: '/spot-the-mistake/play/:id',
        component: GamePlayPage,
        auth: false,
        title: 'Play Game',
    },
    gameDemoPage: {
        path: '/spot-the-mistake/demo',
        component: Demo,
        auth: false,
        title: 'Game Demo',
    },
    publicSpotTheMistakePage: {
        path: '/spot-mistake',
        component: PublicSpotTheMistake,
        auth: false,
        title: 'Spot the Mistake - Public',
    },
    publicIndexPage: {
        path: '/',
        component: PublicIndex,
        auth: false,
        title: 'Spot the Mistake - Home',
    },
};

export default routes;
