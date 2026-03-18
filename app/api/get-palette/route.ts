import { NextResponse } from 'next/server';

export const runtime = 'nodejs';


export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    // Allow user to pass a seed color, or default to a modern vibrant one
    const baseColor = searchParams.get('hex') || 'FF6B6B';
    const mode = searchParams.get('mode') || 'analogic';

    try {
        // Using The Color API (public, no key required) for generation
        const res = await fetch(`https://www.thecolorapi.com/scheme?hex=${baseColor}&mode=${mode}&count=5&format=json`);

        if (!res.ok) throw new Error('Color API failed');

        const data = await res.json();

        // Extract hex values
        const colors = data.colors.map((c: any) => c.hex.value);

        return NextResponse.json({ colors });
    } catch (error: any) {
        console.error('Palette API Error:', error);
        // Fallback modern palette
        return NextResponse.json({
            colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#F7FFF7'],
            isFallback: true
        });
    }
}
