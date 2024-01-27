import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
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

        const body = await req.json();
        const { name, discount, discountType, startDate, endDate } = body;

        if (!name || !discount || !discountType || !startDate || !endDate) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const createdPromocode = await prismadb.promocode.create({
            data: {
                storeId: params.storeId,
                name,
                discount,
                discountType,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            },
        });

        console.log("Created PROMOCODE: ", createdPromocode)

        return NextResponse.json(createdPromocode);

    } catch (error) {
        console.log('[PROMOCODE_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
    try {

        const origin = req.headers.get('origin');

        const { searchParams } = new URL(req.url)
        const name = searchParams.get("name") || undefined;

        if (!params.storeId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        let promocodes;

        if (name !== undefined) {
            promocodes = await prismadb.promocode.findFirst({
                where: {
                    storeId: params.storeId,
                    name: name
                },
            });
        } else {
            promocodes = null
        }

        return NextResponse.json(promocodes, {
            headers: {
                'Access-Control-Allow-Origin': origin || "*",
                'Content-Type': 'application/json',
                "Cache-Control": "public"
            }
        });


    } catch (error) {
        console.log('[PROMOCODE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
