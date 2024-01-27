"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Billboard } from "@prisma/client"
import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { BrandColumn, columns } from "./columns";
import { ApiList } from "@/components/ui/api-list";

interface BrandClientProps {
    data: BrandColumn[]
}

export const BrandClient: React.FC<BrandClientProps> = ({
    data
}) => {

    const router = useRouter();
    const params = useParams();
    
    return(
        <>
        <div className="flex items-center justify-between">
            <Heading
            title={`Brands (${data.length})`}
            description="Manage brands for your store"
            />
            <Button onClick={() => router.push(`/${params.storeId}/brands/new`)}>
                <Plus className="mr-2 h-4 w-4"/>
                Add New
            </Button>
        </div>
        <Separator/>
        <DataTable searchKey="name" columns={columns} data={data}/>
        <Heading title="API" description="API calls for Brands"/>
        <Separator/>
        <ApiList entityName="brands" entityIdName="brandId"/>
        </>
    );
}