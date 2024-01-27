import prismadb from "@/lib/prismadb";
import { ProductsForm } from "./components/product-form";

interface ProductPageProps {
    params: {
        productId: string;
    }
}

const ProductPage: React.FC<ProductPageProps> = async ({
    params
}) => {

    const product = await prismadb.product.findUnique({
        where: {
            id: params.productId
        },
        include: {
            images: true,
            sizes: true,
        }
    });

    if (product) {
        product.sizes.sort((a, b) => b.value - a.value);
    }

    // const categories = await prismadb.category.findMany({
    //     where: {
    //         storeId: params.storeId
    //     }
    // });

    // const colors = await prismadb.color.findMany({
    //     where: {
    //         storeId: params.storeId
    //     }
    // });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ProductsForm
                    // categories={categories}
                    // colors={colors}
                    initialData={product} />
            </div>
        </div>
    );
}

export default ProductPage;