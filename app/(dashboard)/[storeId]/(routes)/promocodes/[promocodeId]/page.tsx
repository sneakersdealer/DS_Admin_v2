import prismadb from "@/lib/prismadb";
import { PromocodeForm } from "./components/promocode-form";

const PromocodePage = async ({
    params
}: {
    params: { promocodeId: string }
}) => {

    const promocode = await prismadb.promocode.findUnique({
        where: {
            id: params.promocodeId
        }
    });

    return(
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <PromocodeForm initialData={promocode}/>
            </div>
        </div>
    );
}

export default PromocodePage;