import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react'

export function Header() {
    const { theme, setTheme } = useTheme();

    const switchTheme = () => {
        if (theme === 'dark') {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    }

    return (
        <header className='sticky top-0 flex h-16 gap-4 border-b bg-background'>
            <div className='flex container items-center px-4 md:px-6'>
                <h1 className='flex-1 shrink-0 whitespace-nowrap text-xl font-semibold'>
                    Powerimo Secrets
                </h1>
                <div className='flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4'>
                    <Button variant='ghost' size='icon' onClick={switchTheme}>
                        <Sun
                            className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0'/>
                        <Moon
                            className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100'/>
                        <span className='sr-only'>Toggle theme</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}