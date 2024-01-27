import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function GET(
    req: Request,
    { params }: { params: { brandId: string } }
) {
    try {

        if (!params.brandId) {
            return new NextResponse("Brand id is required", { status: 400 });
        }

        const brands = await prismadb.brand.findUnique({
            where: {
                id: params.brandId
            },
        });

        return NextResponse.json(brands);

    } catch (error) {
        console.log('[BRANDS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string, brandId: string } }
) {
    try {

        const { userId } = auth();
        const body = await req.json();
        const { 
            name,
            url,
            description
         } = body;

         if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!url) {
            return new NextResponse("PictureUrl is required", { status: 400 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!params.brandId) {
            return new NextResponse("brand id is required", { status: 400 });
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

        await prismadb.brand.update({
            where: {
                id: params.brandId,
            },
            data: {
                name,
                url,
                description,
                storeId: params.storeId,
            }
        });

        const brand = await prismadb.brand.update({
            where: {
                id: params.brandId,
            },
            data: {
                name,
                url,
                description,
                storeId: params.storeId,
            }
        });

        return NextResponse.json(brand);

    } catch (error) {
        console.log('[BRAND_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, brandId: string } }
) {
    try {

        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!params.brandId) {
            return new NextResponse("Brand id is required", { status: 400 });
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

        const brand = await prismadb.brand.deleteMany({
            where: {
                id: params.brandId,
            }
        });

        return NextResponse.json(brand);

    } catch (error) {
        console.log('[BRAND_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};