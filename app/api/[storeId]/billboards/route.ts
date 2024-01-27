import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
    try {
        const { userId } = auth();
        // const userId = "user_2TzegvsdS8xgBsJkxpGqTkzmHmR"
        const body = await req.json();
        const { label, description, imageUrl } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!label) {
            return new NextResponse("Label is required", { status: 400 });
        }
        
        if (!description) {
            return new NextResponse("Description is required", { status: 400 });
        }

        if (!imageUrl) {
            return new NextResponse("Image Url is required", { status: 400 });
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

        const billboard = await prismadb.billboard.create({
            data: {
                label,
                description,
                imageUrl,
                storeId: params.storeId
            }
        });

        return NextResponse.json(billboard);

    } catch (error) {
        console.log('[BILLBOARDS_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
    try {

        if (!params.storeId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const billboard = await prismadb.billboard.findMany({
            where: {
                storeId: params.storeId
            },
        });

        return NextResponse.json(billboard);

    } catch (error) {
        console.log('[BILLBOARDS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}