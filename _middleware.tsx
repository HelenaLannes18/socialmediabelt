import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest, ev: NextFetchEvent) {
    const { pathname } = req.nextUrl;
    const hostname = req.headers.get('host') || ''
    if (!(pathname.startsWith('/app') || pathname.startsWith('/api'))) {
        const url = req.nextUrl.clone();
        //divisao parar encontrar a primeira parte[0]
        let slug = hostname.split(':')[0]
        if (
            hostname.indexOf('.socialmediabelt.com') >= 0 ||
            hostname.indexOf('.smb-local') >= 0
        ) {
            //subdominio
            slug = hostname.split('.')[0];
        }
        if (hostname === 'localhost') {
            slug = 'meutenant';
            return '';
        }

        url.pathname = '/' + slug + '' + pathname;
        if (hostname !== 'localhost:3000') {
            return NextResponse.rewrite(url);
        }
    }
}
