import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function GET(
    req: Request,
    { params }: { params: { brandName: string } }
) {
    try {

        if (!params.brandName) {
            return new NextResponse("Brand name is required", { status: 400 });
        }

        const brands = await prismadb.brand.findFirst({
            where: {
                name: params.brandName
            },
        });

        return NextResponse.json(brands);

    } catch (error) {
        console.log('[BRANDS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};
