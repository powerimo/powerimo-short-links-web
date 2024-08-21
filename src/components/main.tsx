import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { CONFIG } from '@/lib/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clipboard, Link } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

const FormSchema = z.object({
    url: z.string().url({ message: 'Please enter a valid URL string' }),
    shortLink: z.string(),
});

type Form = z.infer<typeof FormSchema>;

export function Main() {
    const form = useForm<Form>({
        mode: 'onChange',
        resolver: zodResolver(FormSchema),
        defaultValues: {
            url: '',
            shortLink: '',
        },
    });

    const { reset, getValues, handleSubmit, control } = form;

    const { toast } = useToast();

    const createLink: SubmitHandler<Form> = async (data) => {

        const response = await fetch(CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: data.url,
        });
        if (response.ok) {
            const linkCreated = await response.text();
            reset({ shortLink: linkCreated });

            navigator.clipboard.writeText(linkCreated);
            toast({
                title: 'Your short link created and copied to clipboard',
                description: linkCreated,
            });
        } else {
            toast({
                title: `Error ${response.status}`,
                description: response.statusText,
                variant: 'destructive',
            });
        }
    }

    const toClipboard = () => {
        const shortLink = getValues('shortLink');

        if (shortLink) {
            navigator.clipboard.writeText(shortLink);
            toast({
                title: 'Your short link copied to clipboard',
                description: shortLink,
            });
        }
    }

    return (
        <div className='flex-1 container content-center px-4 md:px-6'>
            <Card className='w-full max-w-lg m-auto border-0'>
                <CardHeader>
                    <CardTitle>Create short link</CardTitle>
                </CardHeader>
                <CardContent className='flex w-full flex-col space-y-6 divide-y'>
                    <Form {...form}>
                        <form onSubmit={handleSubmit(createLink)}>
                            <FormField
                                control={control}
                                name='url'
                                render={({ field }) => {
                                    return (
                                        <FormItem className='w-full'>
                                            <FormLabel>Enter the URL to shorten and click on link button</FormLabel>
                                            <FormControl>
                                                <div className='flex items-end space-x-2'>
                                                    <Input placeholder='your url' {...field} />
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        //isDisabled={!isValidUrl || !url}
                                                        type='submit'
                                                    ><Link/></Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    );
                                }}
                            />
                            <FormField
                                control={control}
                                name='shortLink'
                                render={({ field }) => {
                                    return !!field.value ? (
                                        <>
                                            <Separator className='my-8'/>
                                            <div className='flex w-full flex-col'>
                                                <span
                                                    className='text-sm font-medium leading-none'>Your short link</span>
                                                <div className='flex items-end space-x-2'>
                                                    <span className='text-lg font-semibold w-full'>{field.value}</span>
                                                    <Button variant='ghost' size='icon' type='button'
                                                            onClick={toClipboard}><Clipboard/></Button>
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