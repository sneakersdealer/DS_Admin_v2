"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { PromocodeColumn, columns } from "./columns";
import { ApiList } from "@/components/ui/api-list";

interface PromocodeClientProps {
    data: PromocodeColumn[]
}

export const PromocodeClient: React.FC<PromocodeClientProps> = ({
    data
}) => {

    const router = useRouter();
    const params = useParams();
    
    return(
        <>
        <div className="flex items-center justify-between">
            <Heading
            title={`Promocodes (${data.length})`}
            description="Manage Promocodes for your store"
            />
            <Button onClick={() => router.push(`/${params.storeId}/promocodes/new`)}>
                <Plus className="mr-2 h-4 w-4"/>
                Add New
            </Button>
        </div>
        <Separator/>
        <DataTable searchKey="name" columns={columns} data={data}/>
        <Heading title="API" description="API calls for Promocodes"/>
        <Separator/>
        <ApiList entityName="promocodes" entityIdName="promocodeId"/>
        </>
    );
}