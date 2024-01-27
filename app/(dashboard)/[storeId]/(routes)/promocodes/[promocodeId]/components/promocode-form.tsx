"use client";

import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Promocode } from "@prisma/client"
import { Trash } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUpload from "@/components/ui/image-upload";
import { date } from "zod";

interface PromocodeFormProps {
    initialData: Promocode | null;
}

const formSchema = z.object({
    name: z.string().min(1),
    discount: z.string().min(1),
    discountType: z.enum(['PERCENT', 'FIXED_AMOUNT']),
    startDate: z.string(),
    endDate: z.string(),
});

type PromocodeFormValues = z.infer<typeof formSchema>;

export const PromocodeForm: React.FC<PromocodeFormProps> = ({
    initialData,
}) => {

    const params = useParams();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? "Edit Promocode" : "Create Promocode";
    const headDescription = initialData ? "Edit a Promocode" : "Add a new Promocode";
    const toastMessage = initialData ? "Promocode updated." : "Promocode created.";
    const action = initialData ? "Save changes" : "Create";

    const startDate = new Date('12.01.2024');

    const endDate = new Date('01.01.2025');

    const form = useForm < PromocodeFormValues > ({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: 'DS2024',
            discount: '10',
            discountType: 'PERCENT',
            startDate: startDate,
            endDate: endDate,
        }
    });

    const onSubmit = async (data: PromocodeFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/promocodes/${params.promocodeId}`, data);
            } else {
                await axios.post(`/api/${params.storeId}/promocodes`, data);
            }
            router.refresh();
            router.push(`/${params.storeId}/promocodes`);
            toast.success(toastMessage);
        } catch (error) {
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/${params.storeId}/promocodes/${params.promocodeId}`)
            router.refresh();
            router.push(`/${params.storeId}/promocodes`);
            toast.success("Promocode deleted.");
        } catch (error) {
            toast.error("Make sure you removed all products using this Promocode first.")
        } finally {
            setLoading(false);
            setOpen(false);
        }
    }

    return (
        <>
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onDelete}
                loading={loading}
            />
            <div className="flex items-center justify-between">
                <Heading title={title} description={headDescription} />
                {initialData && (
                    <Button
                        disabled={loading}
                        variant="destructive"
                        size="icon"
                        onClick={() => setOpen(true)}>
                        <Trash className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <Separator />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                    <div className="grid grid-cols-3 gap-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Promocode name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="discount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discount</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} type="number" placeholder="Promocode discount" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="discountType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discount Type</FormLabel>
                                    <Select
                                        disabled={loading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <SelectTrigger>
                                            <SelectValue defaultValue={field.value} placeholder="Select a discount type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PERCENT">Percent</SelectItem>
                                            <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} type="date" placeholder="Start Date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>End Date</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} type="date" placeholder="End Date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button disabled={loading} className="ml-auto" type="submit">
                        {action}
                    </Button>
                </form>
            </Form>
        </>
    );
};