import { Layout } from '@/components/layout';
import { Main } from '@/pages/main';
import { NotFound } from '@/pages/not-found';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { CONFIG } from '@/lib/config';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout><Main/></Layout>,
        errorElement: <Layout><NotFound/></Layout>,
    },
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
