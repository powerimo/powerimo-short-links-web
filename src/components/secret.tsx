import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useEffect, useState} from "react";
import { useParams } from 'react-router-dom';
import {CONFIG} from '@/lib/config';

export function Secret() {

    const { code } = useParams();
    
    const [secret, setSecret] = useState<string>('');

    console.log(code, `${CONFIG.apiSecretsUrl}/${code}`);

    useEffect( () => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${CONFIG.apiSecretsUrl}/${code}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'text/html' },
                });
    
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
    
                const text = await response.text();
                setSecret(text);
            } catch(e) {
                console.log(e);
            }
    
        }
        fetchData();
    });




    return (
        <div className='flex-1 container content-center px-4 md:px-6'>
            <Card className='w-full m-auto border-0'>
                <CardHeader>
                    <CardTitle>The secret</CardTitle>
                </CardHeader>
                <CardContent className='flex w-full flex-col space-y-6 divide-y'>
                   {secret}
               </CardContent>
            </Card>
        </div>
    );
}