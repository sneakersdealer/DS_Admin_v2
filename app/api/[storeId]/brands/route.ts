import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
    // try {
        const { userId } = auth();
        const body = await req.json();
        const {
            name,
            url,
            description,
        } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }
        
        if (!name) {
            return new NextResponse("name is required", { status: 400 });
        }
        if (!description) {
            return new NextResponse("description is required", { status: 400 });
        }

        if (!url) {
            return new NextResponse("PictureUrl is required", { status: 400 });
        }

        if (!params.storeId) {
            return new NextResponse("Store Id is required", { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const brand = await prismadb.brand.create({
            data: {
                name,
                url,
                description,
                storeId: params.storeId,
            }
        });

        console.log("Created brand: ", brand)

        return NextResponse.json(brand);

    // } catch (error) {
    //     console.log('[BRANDS_POST]', error);
    //     return new NextResponse("Internal error", { status: 500 });
    // }
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
    try {

        const origin = req.headers.get('origin');

        const { searchParams } = new URL(req.url)

        if (!params.storeId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const brands = await prismadb.brand.findMany({
            where: {
                storeId: params.storeId,
            },

        });

        return NextResponse.json(brands, {
            headers: {
                'Access-Control-Allow-Origin': origin || "*",
                'Content-Type': 'application/json',
                "Cache-Control": "public"
            }
        });

    } catch (error) {
        console.log('[BRANDS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}