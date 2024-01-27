import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
    try {

        const origin = req.headers.get('origin')

        const { searchParams } = new URL(req.url)
        const searchQuery = searchParams.get("searchQuery") || undefined;;
        const isFeatured = searchParams.get("isFeatured") || undefined;
        const getAmount = searchParams.has("getAmount") || undefined;

        if (!params.storeId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        let amount;

        if (getAmount) {
            const totalCount = await prismadb.product.count({
                where: {
                    storeId: params.storeId,
                    name: {
                        contains: searchQuery
                    },
                    isFeatured: isFeatured ? true : undefined,
                    isArchived: false
                },
            });
        
            console.log("totalCount ", totalCount)
            amount = totalCount;
        }

        return NextResponse.json(amount, {
            headers: {
                'Access-Control-Allow-Origin': origin || "*",
                'Content-Type': 'application/json',
                "Cache-Control": "public"
            }
        });

    } catch (error) {
        console.log('[PRODUCTS_AMOUNT_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}