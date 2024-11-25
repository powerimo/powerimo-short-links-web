import { Layout } from '@/components/layout';
import { Main } from '@/components/main';
import { NotFound } from '@/components/not-found';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { CONFIG } from '@/lib/config';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Secret } from './components/secret';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout><Main/></Layout>,
        errorElement: <Layout><NotFound/></Layout>,
    },
    {
        path: '/:code',
        element: <Layout><Secret/></Layout>,
    }
], {
    basename: CONFIG.baseDir,
});


function App() {
    return (
        <ThemeProvider defaultTheme='dark'>
            <RouterProvider router={router}/>
            <Toaster/>
        </ThemeProvider>
    )
}

export default App
