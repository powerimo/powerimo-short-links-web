import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { CONFIG } from '@/lib/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clipboard, Link, X } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

const FormSchema = z.object({
    url: z.string().url({ message: 'Please enter a valid URL string' }),
    dateTime: z.date().optional(),
    hitLimit: z.preprocess(
        (v) => (v === '' ? null : v),
        z.nullable(z.coerce.number({ message: 'Please enter a valid positive integer' }).int().positive()),
    ),
    shortLink: z.string(),
});

type Form = z.infer<typeof FormSchema>;

export function Main() {
    const form = useForm<Form>({
        mode: 'onChange',
        resolver: zodResolver(FormSchema),
        defaultValues: {
            url: '',
            dateTime: undefined,
            hitLimit: null,
            shortLink: '',
        },
    });

    const { reset, getValues, setValue, handleSubmit, control } = form;

    const { toast } = useToast();

    const createLink: SubmitHandler<Form> = async (data) => {
        const ttl = data.dateTime ? Math.round((data.dateTime.getTime() - Date.now()) / 1000) : undefined;

        const url =
            CONFIG.apiUrl +
            '?' +
            new URLSearchParams({
                ...(ttl && { ttl: ttl.toString() }),
                ...(data.hitLimit && { limit_hits: data.hitLimit.toString() }),
            });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: data.url,
        });
        if (response.ok) {
            const linkCreated = await response.text();
            reset({ shortLink: linkCreated });

            if (navigator.clipboard) {
                navigator.clipboard.writeText(linkCreated);
                toast({
                    title: 'Your short link created and copied to clipboard',
                    description: linkCreated,
                });
            } else {
                toast({
                    title: 'Your short link created',
                    description: linkCreated,
                });
            }
        } else {
            const errorData = await response.json();
            toast({
                title: `Error ${response.status}`,
                description: errorData.message || response.statusText,
                variant: 'destructive',
            });
        }
    };

    const handleToClipboard = () => {
        if (!navigator.clipboard) return;

        const shortLink = getValues('shortLink');

        if (shortLink) {
            navigator.clipboard.writeText(shortLink);
            toast({
                title: 'Your short link copied to clipboard',
                description: shortLink,
            });
        }
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setValue('dateTime', date);
        }
    };

    const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
        const currentDate = form.getValues('dateTime') || new Date();
        let newDate = new Date(currentDate);

        if (type === 'hour') {
            const hour = parseInt(value, 10);
            newDate.setHours(hour);
        } else if (type === 'minute') {
            newDate.setMinutes(parseInt(value, 10));
        }

        setValue('dateTime', newDate);
    };

    const handleClearDatetime = () => {
        setValue('dateTime', undefined);
    };

    const handleClearHitLimit = () => {
        setValue('hitLimit', null, { shouldValidate: true });
    };

    return (
        <div className='flex-1 container content-center px-4 md:px-6'>
            <Card className='w-full max-w-lg m-auto border-0'>
                <CardHeader>
                    <CardTitle>Create short link</CardTitle>
                </CardHeader>
                <CardContent className='flex w-full flex-col space-y-6'>
                    <Form {...form}>
                        <form onSubmit={handleSubmit(createLink)}>
                            <FormField
                                control={control}
                                name='url'
                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel>Enter the URL to shorten and click on link button</FormLabel>
                                            <FormControl>
                                                <div className='flex items-end space-x-2'>
                                                    <Input
                                                        placeholder='your url'
                                                        {...field}
                                                    />
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        type='submit'
                                                        className='flex-none'
                                                    >
                                                        <Link />
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                            <div className='flex w-full flex-row space-x-6 mt-4'>
                                <FormField
                                    control={form.control}
                                    name='dateTime'
                                    render={({ field }) => (
                                        <FormItem className='flex-1'>
                                            <FormLabel>Expiration time (optional)</FormLabel>
                                            <Popover>
                                                <div className='flex items-end space-x-2'>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={'outline'}
                                                                type='button'
                                                                className={cn(
                                                                    'justify-start font-normal px-3',
                                                                    !field.value && 'text-muted-foreground',
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, 'dd.MM.yyyy HH:mm')
                                                                ) : (
                                                                    <span>click to select</span>
                                                                )}
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    {field.value ? (
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            type='button'
                                                            className='flex-none'
                                                            onClick={handleClearDatetime}
                                                        >
                                                            <X />
                                                        </Button>
                                                    ) : (
                                                        <div className='flex-none w-10' />
                                                    )}
                                                </div>
                                                <PopoverContent className='w-auto p-0'>
                                                    <div className='sm:flex'>
                                                        <Calendar
                                                            mode='single'
                                                            selected={field.value}
                                                            onSelect={handleDateSelect}
                                                            initialFocus
                                                        />
                                                        <div className='flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x'>
                                                            <ScrollArea className='w-64 sm:w-auto'>
                                                                <div className='flex sm:flex-col p-2'>
                                                                    {Array.from({ length: 24 }, (_, i) => i).map(
                                                                        (hour) => (
                                                                            <Button
                                                                                key={hour}
                                                                                size='icon'
                                                                                variant={
                                                                                    field.value &&
                                                                                    field.value.getHours() === hour
                                                                                        ? 'default'
                                                                                        : 'ghost'
                                                                                }
                                                                                className='sm:w-full shrink-0 aspect-square'
                                                                                onClick={() =>
                                                                                    handleTimeChange(
                                                                                        'hour',
                                                                                        hour.toString(),
                                                                                    )
                                                                                }
                                                                            >
                                                                                {hour}
                                                                            </Button>
                                                                        ),
                                                                    )}
                                                                </div>
                                                                <ScrollBar
                                                                    orientation='horizontal'
                                                                    className='sm:hidden'
                                                                />
                                                            </ScrollArea>
                                                            <ScrollArea className='w-64 sm:w-auto'>
                                                                <div className='flex sm:flex-col p-2'>
                                                                    {Array.from({ length: 12 }, (_, i) => i * 5).map(
                                                                        (minute) => (
                                                                            <Button
                                                                                key={minute}
                                                                                size='icon'
                                                                                variant={
                                                                                    field.value &&
                                                                                    field.value.getMinutes() === minute
                                                                                        ? 'default'
                                                                                        : 'ghost'
                                                                                }
                                                                                className='sm:w-full shrink-0 aspect-square'
                                                                                onClick={() =>
                                                                                    handleTimeChange(
                                                                                        'minute',
                                                                                        minute.toString(),
                                                                                    )
                                                                                }
                                                                            >
                                                                                {minute.toString().padStart(2, '0')}
                                                                            </Button>
                                                                        ),
                                                                    )}
                                                                </div>
                                                                <ScrollBar
                                                                    orientation='horizontal'
                                                                    className='sm:hidden'
                                                                />
                                                            </ScrollArea>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name='hitLimit'
                                    render={({ field }) => {
                                        return (
                                            <FormItem className='flex-1'>
                                                <FormLabel>Hit limit (optional)</FormLabel>
                                                <FormControl>
                                                    <div className='flex items-end space-x-2'>
                                                        <Input
                                                            className='tabular-nums'
                                                            placeholder='input limit'
                                                            {...field}
                                                            value={field.value ?? ''}
                                                        />
                                                        {field.value ? (
                                                            <Button
                                                                variant='ghost'
                                                                size='icon'
                                                                type='button'
                                                                className='flex-none'
                                                                onClick={handleClearHitLimit}
                                                            >
                                                                <X />
                                                            </Button>
                                                        ) : (
                                                            <div className='flex-none w-10' />
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />
                            </div>
                            <FormField
                                control={control}
                                name='shortLink'
                                render={({ field }) => {
                                    return !!field.value ? (
                                        <>
                                            <Separator className='my-8' />
                                            <div className='flex w-full flex-col'>
                                                <span className='text-sm font-medium leading-none'>
                                                    Your short link
                                                </span>
                                                <div className='flex items-end space-x-2'>
                                                    <span className='text-lg font-semibold w-full'>{field.value}</span>
                                                    {navigator.clipboard && (
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            type='button'
                                                            onClick={handleToClipboard}
                                                        >
                                                            <Clipboard />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <></>
                                    );
                                }}
                            />
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
