import { NextResponse } from 'next/server';

export const runtime = 'nodejs';


export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword');

    if (!keyword) return NextResponse.json({ error: 'Missing keyword' }, { status: 400 });

    const apiKey = process.env.NOUN_PROJECT_KEY;
    const apiSecret = process.env.NOUN_PROJECT_SECRET;

    // Mock fallback if keys are missing
    if (!apiKey || !apiSecret) {
        console.warn('Noun Project keys missing. Returning mock icon.');
        return NextResponse.json({ iconUrl: null, mock: true });
    }

    // Noun Project uses OAuth 1.0 but basic interaction might differ.
    // Following user prompt suggestion (Bearer), but standard is usually OAuth.
    // We will try standard fetch. If it fails, user needs to adjust auth method.

    try {
        const response = await fetch(`https://api.thenounproject.com/v2/icon?query=${keyword}&limit=1`, {
            headers: {
                'Authorization': `Bearer ${apiKey}:${apiSecret}`, // Hypothetical usage based on prompt
                // Or Basic Auth: 'Authorization': 'Basic ' + Buffer.from(apiKey + ":" + apiSecret).toString('base64')
            },
        });

        if (!response.ok) {
            throw new Error(`Noun Project API Error: ${response.status}`);
        }

        const data = await response.json();
        const iconUrl = data.icons?.[0]?.icon_url;

        return NextResponse.json({ iconUrl });
    } catch (error: any) {
        console.error('Get Icon Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
