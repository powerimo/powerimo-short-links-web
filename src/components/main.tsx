import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { CONFIG } from '@/lib/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clipboard, Link } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import {Textarea} from "@/components/ui/textarea.tsx";
import {Input} from "@/components/ui/input.tsx";

const FormSchema = z.object({
    secretText: z.string(),
    secretUrl: z.string(),
    hitLimit: z.number().optional(),
    ttl: z.number().optional()
});

type Form = z.infer<typeof FormSchema>;

export function Main() {
    const form = useForm<Form>({
        mode: 'onChange',
        resolver: zodResolver(FormSchema),
        defaultValues: {
            secretText: '',
            secretUrl: '',
            hitLimit: 1,
        },
    });

    const { reset, getValues, handleSubmit, control } = form;

    const { toast } = useToast();

    const createLink: SubmitHandler<Form> = async (data) => {
        const requestBody = JSON.stringify({
            secret: data.secretText,
            hitLimit: data.hitLimit,
            ttl: data.ttl ?? data.ttl
        });

        const response = await fetch(CONFIG.apiSecretsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: requestBody,
        });
        if (response.ok) {
            const responseData = await response.json();
            const linkCreated = responseData.url;
            reset({ secretUrl: linkCreated });

            await navigator.clipboard.writeText(linkCreated);
            toast({
                title: 'Link to the secret created and copied to the clipboard',
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
        const secretLink = getValues('secretUrl');

        if (secretLink) {
            navigator.clipboard.writeText(secretLink).then(() => {
                    toast({
                        title: 'Copied',
                        description: secretLink,
                    });
                }
            );

        }
    }

    return (
        <div className='flex-1 container content-center px-4 md:px-6'>
            <Card className='w-full m-auto border-0'>
                <CardHeader>
                    <CardTitle>Create secret</CardTitle>
                </CardHeader>
                <CardContent className='flex w-full flex-col space-y-6 divide-y'>
                    <Form {...form}>
                        <form onSubmit={handleSubmit(createLink)}>
                            <FormField
                                control={control}
                                name='secretText'
                                render={({ field }) => {
                                    return (
                                        <FormItem className='w-full'>
                                            <FormLabel>Input your secret text here</FormLabel>
                                            <FormControl>
                                                <div className='flex items-end space-x-2'>
                                                    <Textarea placeholder='Secret text' {...field} />
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        type='submit'
                                                    ><Link/></Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    );
                                }}
                            />
                            {/* Hit Limit Field */}
                            <FormField
                                name="hitLimit"
                                control={control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hits limit</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Enter limit"
                                                {...field}
                                                value={field.value?.toString() || ''}
                                                onChange={(e) =>
                                                    field.onChange(Number(e.target.value || 0))
                                                }
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            {/* TTL Field */}
                            <FormField
                                name="ttl"
                                control={control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Time to live (seconds, optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Enter TTL"
                                                {...field}
                                                value={field.value?.toString() || ''}
                                                onChange={(e) =>
                                                    field.onChange(Number(e.target.value || 0))
                                                }
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name='secretUrl'
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