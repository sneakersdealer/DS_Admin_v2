import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function GET(
    req: Request,
    { params }: { params: { promocodeId: string } }
) {
    try {

        if (!params.promocodeId) {
            return new NextResponse("promocode id is required", { status: 400 });
        }

        const promocodes = await prismadb.promocode.findUnique({
            where: {
                id: params.promocodeId
            },
        });

        return NextResponse.json(promocodes);

    } catch (error) {
        console.log('[PROMOCODE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string, promocodeId: string } }
) {
    try {

        const { userId } = auth();
        const body = await req.json();
        const { name, discount, discountType, startDate, endDate } = body;
    
        if (!userId) {
          return new NextResponse("Unauthenticated", { status: 401 });
        }
    
        if (!name || !discount || !discountType || !startDate || !endDate) {
          return new NextResponse("Missing required fields", { status: 400 });
        }
    
        if (!params.promocodeId) {
          return new NextResponse("Promocode id is required", { status: 400 });
        }
    
        const storeByUserId = await prismadb.store.findFirst({
          where: {
            id: params.storeId,
            userId,
          },
        });
    
        if (!storeByUserId) {
          return new NextResponse("Unauthorized", { status: 403 });
        }
    
        const updatedPromocode = await prismadb.promocode.update({
          where: {
            id: params.promocodeId,
          },
          data: {
            name,
            discount,
            discountType,
            startDate,
            endDate,
            storeId: params.storeId,
          },
        });
    
        return NextResponse.json(updatedPromocode);

    } catch (error) {
        console.log('[PROMOCODE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, promocodeId: string } }
) {
    try {

        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!params.promocodeId) {
            return new NextResponse("promocode id is required", { status: 400 });
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

        const promocode = await prismadb.promocode.deleteMany({
            where: {
                id: params.promocodeId,
            }
        });

        return NextResponse.json(promocode);

    } catch (error) {
        console.log('[PROMOCODE_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};