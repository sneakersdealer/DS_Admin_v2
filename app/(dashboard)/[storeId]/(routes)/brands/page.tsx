import prismadb from "@/lib/prismadb";
import { BrandClient } from "./components/client";
import { BrandColumn } from "./components/columns";
import { format } from "date-fns";

const BrandsPage = async ({
    params
}: {
    params: { storeId: string }
}) => {

    const brands = await prismadb.brand.findMany({
        where: {
            storeId: params.storeId
        },
    });

    const formattedBrand: BrandColumn[] = brands.map((item) => ({
        id: item.id,
        name: item.name,
    }));

    return(
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <BrandClient data={formattedBrand}/>
            </div>
        </div>
    );
};

export default BrandsPage;