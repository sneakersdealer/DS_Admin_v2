import prismadb from "@/lib/prismadb";
import { PromocodeClient } from "./components/client";
import { PromocodeColumn } from "./components/columns";
import { format } from "date-fns";

const PromocodesPage = async ({
    params
}: {
    params: { storeId: string }
}) => {

    const promocodes = await prismadb.promocode.findMany({
        where: {
            storeId: params.storeId
        },
    });

    const formattedPromocode: PromocodeColumn[] = promocodes.map((item) => ({
        id: item.id,
        name: item.name,
    }));

    return(
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <PromocodeClient data={formattedPromocode}/>
            </div>
        </div>
    );
};

export default PromocodesPage;