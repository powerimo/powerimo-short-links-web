import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { CONFIG } from '@/lib/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clipboard } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Textarea } from "@/components/ui/textarea.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useEffect, useState } from "react";

const DEFAULT_TTL = 60 * 60 * 24 * 7; // 1 week
const DEFAULT_HIT_LIMIT = 1;

const FormSchema = z.object({
    secretText: z.string(),
    secretUrl: z.string(),
    hitLimit: z.number().optional().default(DEFAULT_HIT_LIMIT),
    ttl: z.number().optional().default(DEFAULT_TTL),
});

type Form = z.infer<typeof FormSchema>;

const addSecondsToDate = (date: Date, seconds: number): Date => {
    return new Date(date.getTime() + seconds * 1000);
};

export function Main() {
    const form = useForm<Form>({
        mode: 'onChange',
        resolver: zodResolver(FormSchema),
        defaultValues: {
            secretText: '',
            secretUrl: '',
            hitLimit: DEFAULT_HIT_LIMIT,
            ttl: DEFAULT_TTL,
        },
    });

    const { reset, getValues, handleSubmit, control, watch, setValue } = form;
    const ttl = watch("ttl") || DEFAULT_TTL;
    const [expireAt, setExpireAt] = useState<Date | null>(addSecondsToDate(new Date(), ttl));
    const { toast } = useToast();

    useEffect(() => {
        if (ttl > 0) {
            setExpireAt(addSecondsToDate(new Date(), ttl));

            const interval = setInterval(() => {
                setExpireAt(addSecondsToDate(new Date(), ttl));
            }, 1000);

            return () => clearInterval(interval); // clear interval
        } else {
            setExpireAt(null);
        }
    }, [ttl]);

    const createLink: SubmitHandler<Form> = async (data) => {
        try {
            const response = await fetch(CONFIG.apiSecretsUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    secret: data.secretText,
                    hitLimit: data.hitLimit,
                    ttl: data.ttl,
                }),
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const responseData = await response.json();
            const linkCreated = responseData.url;

            reset({
                secretText: '',
                secretUrl: linkCreated,
                hitLimit: DEFAULT_HIT_LIMIT,
                ttl: DEFAULT_TTL,
            });

            await navigator.clipboard.writeText(linkCreated);
            toast({ title: 'Link created and copied to clipboard', description: linkCreated });
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

    const updateTtl = (value: number) => {
        setValue('ttl', value);
    };

    const incrementTtl = (value: number) => {
        setValue('ttl', ttl + value);
    };

    return (
        <div className="flex-1 container content-center px-4 md:px-6">
            <Card className="w-full m-auto border-0">
                <CardHeader>
                    <CardTitle>Create Secret</CardTitle>
                </CardHeader>
                <CardContent className="flex w-full flex-col space-y-6 divide-y">
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
                                        {expireAt && <p>Expires at: {expireAt.toLocaleString()}</p>}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <Button onClick={() => updateTtl(3600)} type="button">
                                                1 hour
                                            </Button>
                                            <Button onClick={() => updateTtl(3600 * 24)} type="button">
                                                1 day
                                            </Button>
                                            <Button onClick={() => updateTtl(3600 * 24 * 7)} type="button">
                                                1 week
                                            </Button>
                                            <Button onClick={() => incrementTtl(3600)} type="button">
                                                +1 hour
                                            </Button>
                                            <Button onClick={() => incrementTtl(3600 * 24)} type="button">
                                                +1 day
                                            </Button>
                                            <Button onClick={() => incrementTtl(3600 * 24 * 7)} type="button">
                                                +1 week
                                            </Button>
                                        </div>
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
                            <Button type="submit" className="w-full">
                                Create Secret
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
