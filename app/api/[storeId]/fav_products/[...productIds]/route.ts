import prismadb from "@/lib/prismadb";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: { productIds: string[] } }
) {
    try {
        if (!params.productIds || params.productIds.length === 0) {
            return new NextResponse("Product ids are required", { status: 400 });
        }

        const products = await prismadb.product.findMany({
            where: {
                id: {
                    in: params.productIds
                }
            },
            include: {
                images: true,
                sizes: true,
            }
        });

        return NextResponse.json(products);

    } catch (error) {
        console.log('[FAV_PRODUCTS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};