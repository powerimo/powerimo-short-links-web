import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Separator} from '@/components/ui/separator';
import {useToast} from '@/components/ui/use-toast';
import {CONFIG} from '@/lib/config';
import {zodResolver} from '@hookform/resolvers/zod';
import {Clipboard} from 'lucide-react';
import {SubmitHandler, useForm} from 'react-hook-form';
import {z} from 'zod';
import {Textarea} from "@/components/ui/textarea.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useEffect, useState} from "react";

const FormSchema = z.object({
    secretText: z.string(),
    secretUrl: z.string(),
    hitLimit: z.number().optional(),
    ttl: z.number().optional()
});

type Form = z.infer<typeof FormSchema>;

const addSecondsToDate = (date: Date, seconds: number) => {
    return new Date(date.getTime() + seconds * 1000);
}

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

    const { reset, getValues, handleSubmit, control, watch } = form;
    // Watch TTL and dynamically calculate expiration date
    const ttl = watch("ttl") || 0;
    const [expireAt, setExpireAt] = useState<Date | null>(null);

    useEffect(() => {
        // Update expiration date based on TTL and current time
        if (ttl > 0) {
            const interval = setInterval(() => {
                setExpireAt(addSecondsToDate(new Date(), ttl));
            }, 1000);

            return () => clearInterval(interval); // Cleanup interval on unmount
        } else {
            setExpireAt(null); // Reset if TTL is not set
        }
    }, [ttl]);
    //const expireAtString = expireAt ? expireAt.toString(): "";

    const { toast } = useToast();

    const createLink: SubmitHandler<Form> = async (data) => {
        try {
            const requestBody = JSON.stringify({
                secret: data.secretText,
                hitLimit: data.hitLimit,
                ttl: data.ttl,
            });

            const response = await fetch(CONFIG.apiSecretsUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: requestBody,
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const responseData = await response.json();
            const linkCreated = responseData.url;
            reset({ ...data, secretUrl: linkCreated });

            await navigator.clipboard.writeText(linkCreated);
            toast({
                title: 'Link created and copied to clipboard',
                description: linkCreated,
            });
        } catch (error: any) {
            toast({
                title: 'Error creating link',
                description: error.message || 'An unknown error occurred',
                variant: 'destructive',
            });
        }
    };

    const copyToClipboard = () => {
        const secretLink = getValues('secretUrl');
        if (secretLink) {
            navigator.clipboard.writeText(secretLink).then(() => {
                toast({ title: 'Copied to clipboard', description: secretLink });
            });
        }
    };

    return (
        <div className='flex-1 container content-center px-4 md:px-6'>
            <Card className='w-full m-auto border-0'>
                <CardHeader>
                    <CardTitle>Create secret</CardTitle>
                </CardHeader>
                <CardContent className='flex w-full flex-col space-y-6 divide-y'>
                    <Form {...form}>
                        <form onSubmit={handleSubmit(createLink)}>
                            {/* Secret Text Field */}
                            <FormField
                                name="secretText"
                                control={control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Input your secret text</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Enter secret text" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Hit Limit Field */}
                            <FormField
                                name="hitLimit"
                                control={control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hit Limit</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Enter hit limit"
                                                {...field}
                                                value={field.value?.toString() || ''}
                                                onChange={(e) =>
                                                    field.onChange(Number(e.target.value || 0))
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* TTL Field */}
                            <FormField
                                name="ttl"
                                control={control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Time to Live (TTL, seconds)</FormLabel>
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
                                        <FormMessage>
                                            {expireAt && `Expires at: ${expireAt.toLocaleString()}`}
                                        </FormMessage>
                                    </FormItem>
                                )}
                            />

                            {/* Generated Link Field */}
                            <FormField
                                name="secretUrl"
                                control={control}
                                render={({ field }) =>
                                    field.value ? (
                                        <>
                                            <Separator className="my-4" />
                                            <div className="flex items-center space-x-2">
                                                <span className="text-lg font-semibold">
                                                    {field.value}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={copyToClipboard}
                                                >
                                                    <Clipboard />
                                                </Button>
                                            </div>
                                        </>
                                    ) : (<></>)
                                }
                            />

                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}