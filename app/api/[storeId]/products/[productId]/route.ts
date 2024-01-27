import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: { productId: string } }
) {
    try {

        if (!params.productId) {
            return new NextResponse("Product id is required", { status: 400 });
        }

        const products = await prismadb.product.findUnique({
            where: {
                id: params.productId
            },
            include: {
                images: true,
                sizes: true,
            }
        });

        return NextResponse.json(products);

    } catch (error) {
        console.log('[PRODUCTS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string, productId: string } }
    // { params }: { params: { slug: string } }
) {
    try {

        const { userId } = auth();
        const body = await req.json();
        const { 
            name,
            pictureUrl,
            price,
            discount,
            slug,
            sku,
            brand,
            silhouette,
            designer,
            details,
            releaseDate,
            upperMaterial,
            singleGender,
            category,
            story,
            sizeUnit,
            sizes,
            color,
            images,
            isFeatured,
            isArchived
         } = body;

         if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        // if (!releaseDate) {
        //     return new NextResponse("ReleaseDate is required", { status: 400 });
        // }

        // if (!upperMaterial) {
        //     return new NextResponse("upperMaterial is required", { status: 400 });
        // }

        // if (!singleGender) {
        //     return new NextResponse("singleGender is required", { status: 400 });
        // }

        // if (!story) {
        //     return new NextResponse("story is required", { status: 400 });
        // }
        // if (!sizes) {
        //     return new NextResponse("sizes is required", { status: 400 });
        // }

        if (!pictureUrl) {
            return new NextResponse("PictureUrl is required", { status: 400 });
        }

        // if (!sku) {
        //     return new NextResponse("sku is required", { status: 400 });
        // }

        // if (!brand) {
        //     return new NextResponse("brand is required", { status: 400 });
        // }

        // if (!silhouette) {
        //     return new NextResponse("silhouette is required", { status: 400 });
        // }

        // if (!designer) {
        //     return new NextResponse("designer is required", { status: 400 });
        // }

        // if (!details) {
        //     return new NextResponse("details is required", { status: 400 });
        // }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!images || !images.length) {
            return new NextResponse("Images is required", { status: 400 });
        }

        if (!price) {
            return new NextResponse("Price is required", { status: 400 });
        }

        // if (!categoryId) {
        //     return new NextResponse("Category Id is required", { status: 400 });
        // }

        // if (!colorId) {
        //     return new NextResponse("Color Id is required", { status: 400 });
        // }

        if (!params.productId) {
            return new NextResponse("Product id is required", { status: 400 });
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

        await prismadb.product.update({
            where: {
                id: params.productId,
            },
            data: {
                name,
                pictureUrl,
                price,
                discount,
                slug,
                sku,
                brand,
                silhouette,
                designer,
                details,
                releaseDate,
                upperMaterial,
                singleGender,
                story,
                category,
                color,
                sizeUnit,
                sizes: {
                    deleteMany: {},
                },
                isFeatured,
                isArchived,
                storeId: params.storeId,
                images: {
                    deleteMany: {}
                }
            }
        });

        const product = await prismadb.product.update({
            where: {
                id: params.productId,
            },
            data: {
                sizes: {
                    createMany: {
                        data: sizes,
                    },
                },
                images: {
                    createMany: {
                        data: [
                            ...images.map((image: { url: string }) => image),
                        ]
                    }
                }
            }
        });

        return NextResponse.json(product);

    } catch (error) {
        console.log('[PRODUCT_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, productId: string } }
) {
    try {

        const { userId } = auth();
        // const userId = "user_2TzegvsdS8xgBsJkxpGqTkzmHmR"

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!params.productId) {
            return new NextResponse("Product id is required", { status: 400 });
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

        const product = await prismadb.product.deleteMany({
            where: {
                id: params.productId,
            }
        });

        return NextResponse.json(product);

    } catch (error) {
        console.log('[PRODUCT_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};