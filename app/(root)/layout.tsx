import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

export default async function SetupLayout({
    children
}: {
    children: React.ReactNode;
}) {
    
    const { userId } = auth();
    // const userId = "user_2TzegvsdS8xgBsJkxpGqTkzmHmR"

    if (!userId) {
        redirect('/sign-in')
    }

    const store = await prismadb.store.findFirst({
        where: {
            userId
        }
    });

    if (store) {
        redirect(`/${store.id}`);
    }

    // const allStores = await prismadb.store.findMany();

    // console.log('All stores:', allStores);
    // redirect(`/57c2da9c-23e8-420a-8da6-408b3544c073`);
// user_2TzegvsdS8xgBsJkxpGqTkzmHmR
    return (
        <>
            {children}
        </>
    );
}