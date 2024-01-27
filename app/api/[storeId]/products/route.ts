import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

const allowedOrigins = process.env.NODE_ENV === 'production' ? [''] : ['http://localhost:3001'];

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
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
        
        if (!sizes) {
            return new NextResponse("sizes is required", { status: 400 });
        }

        if (!pictureUrl) {
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

        const product = await prismadb.product.create({
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
                category,
                story,
                color,
                sizeUnit,
                sizes: {
                    createMany: {
                        data: sizes,
                    },
                },
                isFeatured,
                isArchived,
                storeId: params.storeId,
                images: {
                    createMany: {
                        data: [
                            ...images.map((image: { url: string }) => image)
                        ]
                    }
                }
            }
        });

        console.log("Created product: ", product)

        return NextResponse.json(product);

    } catch (error) {
        console.log('[PRODUCTS_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
    try {

        const origin = req.headers.get('origin');

        const { searchParams } = new URL(req.url)
        const searchQuery = searchParams.get("searchQuery") || undefined;
        const isFeatured = searchParams.get("isFeatured") || undefined;
        const getCount = searchParams.has("getCount") || undefined;
        const silhouette = searchParams.get("silhouette") || undefined;
        const details = searchParams.get("details") || undefined;
        const page = parseInt(searchParams.get("page") || '0');
        const productBrand = searchParams.get("brand") || undefined;
        // const amount = searchParams.get("amount") || undefined;

        // const page = parseInt(searchParams.get("page") || "0", 30);
        // const page = searchParams.has("page") ? parseInt(searchParams.get("page") || "1", 10) : undefined;
        const pageSize = 30;

        console.log("page", page)

        if (!params.storeId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        let products;
            if (silhouette) {
                products = await prismadb.product.findMany({
                    take: 8,
                    where: {
                        storeId: params.storeId,
                        silhouette: silhouette,
                        isFeatured: isFeatured ? true : undefined,
                        isArchived: false
                    },
                    include: {
                        images: true,
                        sizes: true,
                    },
                });
            } else {
                if (page && page >= 1) {
                    const skip = page && (page - 1) * pageSize;

                    products = await prismadb.product.findMany({
                        take: pageSize,
                        skip,
                        where: {
                            storeId: params.storeId,
                            name: {
                                contains: searchQuery
                            },
                            brand: productBrand,
                            isFeatured: isFeatured ? true : undefined,
                            isArchived: false
                        },
                        include: {
                            images: true,
                            sizes: true,
                        },
                    });
                } else {
                    products = await prismadb.product.findMany({
                        where: {
                            storeId: params.storeId,
                            name: {
                                contains: searchQuery
                            },
                            brand: productBrand,
                            isFeatured: isFeatured ? true : undefined,
                            isArchived: false
                        },
                        include: {
                            images: true,
                            sizes: true,
                        },
                    });
                }
            }


        // const products = await prismadb.product.findMany({
        //     where: {
        //         storeId: params.storeId,
        //         name: {
        //             contains: searchQuery
        //         },
        //         categoryId,
        //         colorId,
        //         isFeatured: isFeatured ? true : undefined,
        //         isArchived: false
        //     },
        //     include: {
        //         images: true,
        //         category: true,
        //         color: true,
        //         sizes: true,
        //     },
        //     // orderBy: {
        //     //     createdAt: 'desc'
        //     // }
        // });

        return NextResponse.json(products, {
            headers: {
                'Access-Control-Allow-Origin': origin || "*",
                'Content-Type': 'application/json',
                "Cache-Control": "public"
            }
        });

    } catch (error) {
        console.log('[PRODUCTS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

// export async function GET(req: Request, { params }: { params: { storeId: string } }) {
//     try {
//         const origin = req.headers.get('origin');

//         const { searchParams } = new URL(req.url);
//         const searchQuery = searchParams.get("searchQuery") || undefined;
//         const categoryId = searchParams.get("categoryId") || undefined;
//         const colorId = searchParams.get("colorId") || undefined;
//         const isFeatured = searchParams.get("isFeatured") || undefined;

//         const page = searchParams.has("page") ? parseInt(searchParams.get("page") || "1", 10) : undefined;
//         const getCount = searchParams.has("getCount");

//         if (!params.storeId) {
//             return new NextResponse("Unauthorized", { status: 403 });
//         }

//         let response;

//         if (getCount) {
//             const totalCount = await prismadb.product.count({
//                 where: {
//                     storeId: params.storeId,
//                     name: {
//                         contains: searchQuery
//                     },
//                     categoryId,
//                     colorId,
//                     isFeatured: isFeatured ? true : undefined,
//                     isArchived: false
//                 },
//             });

//             response = { totalCount };
//         } else {
//             const pageSize = 30;
//             const skip = page ? (page - 1) * pageSize : 0;

//             const products = await prismadb.product.findMany({
//                 take: pageSize,
//                 skip,
//                 where: {
//                     storeId: params.storeId,
//                     name: {
//                         contains: searchQuery
//                     },
//                     categoryId,
//                     colorId,
//                     isFeatured: isFeatured ? true : undefined,
//                     isArchived: false
//                 },
//                 include: {
//                     images: true,
//                     category: true,
//                     color: true,
//                     sizes: true,
//                 },
//             });

//             response = { products };
//         }

//         return NextResponse.json(response, {
//             headers: {
//                 'Access-Control-Allow-Origin': origin || "*",
//                 'Content-Type': 'application/json',
//                 "Cache-Control": "public"
//             }
//         });

//     } catch (error) {
//         console.log('[PRODUCTS_GET]', error);
//         return new NextResponse("Internal error", { status: 500 });
//     }
// }


export async function DELETE(req: Request, { params }: { params: { storeId: string } }) {
    try {
        if (!params.storeId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        await prismadb.product.deleteMany({
            where: {
                storeId: params.storeId,
            },
        });

        return new NextResponse("All products deleted successfully", { status: 200 });

    } catch (error) {
        console.log('[DELETE_PRODUCTS]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
