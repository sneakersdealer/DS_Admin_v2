"use client";

import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Image, Product, Size } from "@prisma/client"
import { Trash } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";
import ImageUpload from "@/components/ui/image-upload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import sneakersData from "@/sneakers_data.json"
import { v4 as uuidv4 } from 'uuid';
import { fi } from "date-fns/locale";

interface ProductsFormProps {
    initialData: Product & {
        images: Image[],
        sizes: Size[]
    } | null;
    // sizes: Size[];
}

const formSchema = z.object({
    name: z.string().min(1),
    pictureUrl: z.string().min(1),
    images: z.object({ url: z.string() }).array(),
    price: z.coerce.number().min(1),
    discount: z.string(),
    sku: z.string().min(1),
    slug: z.string().min(1),
    brand: z.string().min(1),
    silhouette: z.string().min(1),
    designer: z.string(),
    details: z.string().min(1),
    releaseDate: z.string().min(1),
    upperMaterial: z.string().min(1),
    singleGender: z.string().min(1),
    story: z.string().min(1),
    sizeUnit: z.string().min(1),
    sizes: z.object({
        value: z.string(),
        price: z.string(),
        inStock: z.boolean().default(false).optional(),
        quantity: z.string()
    }).array(),
    category: z.string().min(1),
    color: z.string().min(1),
    isFeatured: z.boolean().default(true).optional(),
    isArchived: z.boolean().default(false).optional(),
});

type ProductsFormValues = z.infer<typeof formSchema>;

export const ProductsForm: React.FC<ProductsFormProps> = ({
    initialData,
}) => {

    const params = useParams();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    // const initialSizesState = {};
    // if (initialData) {
    //     initialData.sizes.forEach((size) => {
    //         initialSizesState[size.value] = size.inStock;
    //     });
    // }

    // const [sizes, setSizes] = useState(initialSizesState);


    const [sizes, setSizes] = useState(initialData ? initialData.sizes : []);

    // Добавление нового размера
    // const addSize = () => {
    //     setSizes([...sizes, { value: "", inStock: false }]);
    // };

    // // Удаление размера по индексу
    // const removeSize = (indexToRemove) => {
    //     const updatedSizes = [...sizes];
    //     updatedSizes.splice(indexToRemove, 1);
    //     setSizes(updatedSizes);
    // };

    const title = initialData ? "Edit product" : "Create product";
    const description = initialData ? "Edit a product" : "Add a new product";
    const toastMessage = initialData ? "Product updated." : "Product created.";
    const action = initialData ? "Save changes" : "Create";

    function extractPartFromUrl(url) {
        const regex = /\/(\d+_\d+)\.jpg\.jpeg/;
        const match = url.match(regex);
        return match && match[1] ? match[1] : null;
    }

    const form = useForm < ProductsFormValues > ({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
            ...initialData,
            price: parseFloat(String(initialData?.price)),
            images: initialData?.images.sort((pic1, pic2) => {
                const part1 = extractPartFromUrl(pic1.url);
                const part2 = extractPartFromUrl(pic2.url);

                return part1.localeCompare(part2);
            })
        } : {
            name: '',
            pictureUrl: '',
            images: [],
            price: 0,
            discount: '',
            sku: '',
            slug: '',
            brand: '',
            silhouette: '',
            designer: '',
            details: '',
            releaseDate: '',
            upperMaterial: '',
            singleGender: '',
            story: '',
            sizeUnit: '',
            sizes: [],
            category: '',
            color: '',
            isFeatured: true,
            isArchived: false,
        }
    });

    const addSneakers = async () => {
        try {
            setLoading(true);
            for (const sneaker of sneakersData) {
                const sneakerPrice = sneaker.price / 100
                const productPictures = sneaker.productTemplateExternalPictures.map(url => ({ url }));
                // const sneakerSize = sneaker.sizeRange.map(size => ({ value: size.toString(), inStock: false }))
                const sneakerSize = Object.entries(sneaker.sizeRange).map(([size, price]) => ({
                    value: size.toString(),
                    price: price.toString(),
                    inStock: false,
                    quantity: "0"
                }));
                const originalDate = new Date(sneaker.releaseDate);
                const options: Intl.DateTimeFormatOptions = {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                };
                const formatter = new Intl.DateTimeFormat('en-US', options);
                const formattedDate = sneaker.releaseDate === "" ? "" : formatter.format(originalDate);

                const designer = sneaker.designer === "" ? "" : sneaker.designer

                const productValues = createProductFormValues(
                    sneaker.name,
                    sneaker.pictureUrl,
                    productPictures,
                    sneakerPrice,
                    '',
                    sneaker.sku,
                    sneaker.slug,
                    sneaker.brand,
                    sneaker.silhouette,
                    designer,
                    sneaker.details,
                    formattedDate,
                    sneaker.upperMaterial,
                    sneaker.singleGender,
                    sneaker.story,
                    sneaker.sizeUnit,
                    sneakerSize,
                    sneaker.category,
                    sneaker.color,
                    true,
                    false
                );
                // console.log(sneaker);
                console.log("productValues: ", productValues);
                await axios.post(`/api/${params.storeId}/products`, productValues);
            }
            router.refresh();
            toast.success("Sneakers added to DB.");
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    function createProductFormValues(
        name: string,
        pictureUrl: string,
        images: Array<{ url: string }>,
        price: number,
        discount: string,
        sku: string,
        slug: string,
        brand: string,
        silhouette: string,
        designer: string,
        details: string,
        releaseDate: string,
        upperMaterial: string,
        singleGender: string,
        story: string,
        sizeUnit: string,
        sizes: Array<{ value: string, price: string, inStock: boolean, quantity: string }>,
        category: string,
        color: string,
        isFeatured: boolean,
        isArchived: boolean,
    ) {
        return {
            name: name || '',
            pictureUrl: pictureUrl || '',
            images: images || [],
            price: price || 0,
            discount: discount || '',
            sku: sku || '',
            slug: slug || '',
            brand: brand || '',
            silhouette: silhouette || '',
            designer: designer || '',
            details: details || '',
            releaseDate: releaseDate || '',
            upperMaterial: upperMaterial || '',
            singleGender: singleGender || '',
            story: story || '',
            sizeUnit: sizeUnit || '',
            sizes: sizes || [],
            category: category || '',
            color: color || '',
            isFeatured: isFeatured === undefined ? true : isFeatured,
            isArchived: isArchived === undefined ? false : isArchived,
        };
    }

    const onSubmit = async (data: ProductsFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/products/${params.productId}`, data);
            } else {
                await axios.post(`/api/${params.storeId}/products`, data);
            }
            router.refresh();
            router.push(`/${params.storeId}/products`);
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
            await axios.delete(`/api/${params.storeId}/products/${params.productId}`)
            router.refresh();
            router.push(`/${params.storeId}/products`);
            toast.success("Product deleted.");
        } catch (error) {
            toast.error("Something went wrong.")
        } finally {
            setLoading(false);
            setOpen(false);
        }
    }

    const onDeleteAllSneakers = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/${params.storeId}/products/`)
            router.refresh();
            router.push(`/${params.storeId}/products`);
            toast.success("Product deleted.");
        } catch (error) {
            console.log("Error:", error)
            toast.error("Something went wrong.")
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
                <Heading title={title} description={description} />
                {initialData && (
                    <Button
                        disabled={loading}
                        variant="destructive"
                        size="icon"
                        onClick={() => setOpen(true)}>
                        <Trash className="h-4 w-4" />
                    </Button>
                )}
                <Button onClick={addSneakers} className="flex justify-center items-center">
                    Add All Sneakers
                </Button>
                <Button onClick={onDeleteAllSneakers} className="flex justify-center items-center">
                    Delete All Sneakers
                </Button>
            </div>
            <Separator />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                    <FormField
                        control={form.control}
                        name="images"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Images</FormLabel>
                                <FormControl>
                                    <ImageUpload
                                        value={field.value.map((image) => image.url)}
                                        disabled={loading}
                                        onChange={(url) => field.onChange([...field.value, { url }])}
                                        onRemove={(url) => field.onChange([...field.value.filter((current) => current.url !== url)])} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    <div className="grid grid-cols-3 gap-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Product name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        <FormField
                            control={form.control}
                            name="pictureUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Picture URL</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Product picture URL" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                        <Input type="number" disabled={loading} placeholder="0.99 $" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                        <FormField
                            control={form.control}
                            name="discount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discount</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="-20%" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                        <FormField
                            control={form.control}
                            name="sku"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>SKU</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Product sku" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>SLUG</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Product slug" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                        <FormField
                            control={form.control}
                            name="brand"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Brand</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Product brand" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                        <FormField
                            control={form.control}
                            name="silhouette"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Silhouette</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Product silhouette" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        <FormField
                            control={form.control}
                            name="designer"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Designer</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Product designer" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        <FormField
                            control={form.control}
                            name="details"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Details</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Product details" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        <FormField
                            control={form.control}
                            name="releaseDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Release Date</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Product release date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        <FormField
                            control={form.control}
                            name="singleGender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Gender" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        <FormField
                            control={form.control}
                            name="story"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descritption</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Descritption" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                        <FormField
                            control={form.control}
                            name="sizeUnit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Size Unit</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Size Unit" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                        <FormField
                            control={form.control}
                            name="sizes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sizes</FormLabel>
                                    <Select
                                        disabled={loading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue defaultValue={field.value} placeholder="Select sizes" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {sizes.map((size, index) => (
                                                <div className="flex items-center px-2 gap-x-1" key={index}>
                                                    <div>
                                                        <p className={`${index !== 0 && 'hidden'}`}>In Stock</p>
                                                        <input
                                                            style={{ marginLeft: 'auto' }}
                                                            type="checkbox"
                                                            checked={size.inStock}
                                                            onChange={(e) => {
                                                                const checked = e.target.checked;
                                                                const updatedSizes = [...sizes];
                                                                updatedSizes[index].inStock = checked;
                                                                setSizes(updatedSizes);

                                                                field.value[index].inStock = checked
                                                            }}
                                                        />
                                                    </div>
                                                    <div className={`${index !== 0 && 'pl-12'}`}>
                                                        <p className={`${index !== 0 && 'hidden'}`}>Quantity</p>
                                                        <input
                                                            className="bg-transparent"
                                                            type="text"
                                                            value={size.quantity}
                                                            onChange={(e) => {
                                                                const newValue = e.target.value;
                                                                const updatedSizes = [...sizes];
                                                                updatedSizes[index].quantity = newValue;
                                                                updatedSizes[index].inStock = newValue !== "0" ? true : false
                                                                setSizes(updatedSizes);

                                                                field.value[index].quantity = newValue;
                                                                console.log(field.value);
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className={`${index !== 0 && 'hidden'}`}>Size</p>
                                                        <input
                                                            className="bg-transparent"
                                                            type="text"
                                                            value={size.value}
                                                            onChange={(e) => {
                                                                const newValue = e.target.value;
                                                                const updatedSizes = [...sizes];
                                                                updatedSizes[index].value = newValue;
                                                                setSizes(updatedSizes);

                                                                field.value[index].value = newValue;
                                                                console.log(field.value);
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className={`${index !== 0 && 'hidden'}`}>Price</p>
                                                        <input
                                                            className="bg-transparent"
                                                            type="text"
                                                            value={size.price}
                                                            onChange={(e) => {
                                                                const newValue = e.target.value;
                                                                const updatedSizes = [...sizes];
                                                                updatedSizes[index].price = newValue;
                                                                setSizes(updatedSizes);

                                                                field.value[index].price = newValue;
                                                                console.log(field.value);
                                                            }}
                                                        />
                                                    </div>
                                                    <button
                                                        style={{ marginLeft: 'auto' }}
                                                        onClick={() => {
                                                            const updatedSizes = [...sizes];
                                                            updatedSizes.splice(index, 1);
                                                            setSizes(updatedSizes);
                                                            field.value.splice(index, 1);
                                                        }}
                                                    >
                                                        <Trash size={15} color={"red"} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button className="bg-white text-black mx-2 px-2 rounded-sm" onClick={() => {
                                                const newSize = {
                                                    id: uuidv4(),
                                                    value: "1",
                                                    price: "0",
                                                    inStock: false,
                                                    quantity: "0",
                                                    productId: initialData ? initialData.id : "",
                                                    product: initialData,
                                                    createdAt: new Date(),
                                                    updatedAt: new Date(),
                                                };

                                                setSizes([...sizes, newSize]);
                                                field.value.push(newSize)
                                                console.log("field.value", field.value);
                                            }}>+ Add Size</button>

                                            {/* {field.value.map((size, index) => (
                                                <div className="flex items-center gap-x-1" key={size.id}>
                                                    {size.value} -
                                                    <input
                                                        type="checkbox"
                                                        value={sizes[size.value] || false}
                                                        checked={sizes[size.value] || false}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setSizes((prevSizes) => ({
                                                                ...prevSizes,
                                                                [size.value]: checked,
                                                            }));
                                                            console.log(size.value, checked);
                                                            size.inStock = checked;
                                                            console.log(index);
                                                        }}
                                                    />
                                                    <button style={{ marginLeft: 'auto' }}
                                                        onClick={() => {
                                                            // field.value.splice(index, 1);
                                                            // console.log(field.value);
                                                            const updatedSizes = [...field.value];
                                                            updatedSizes.splice(index, 1);
                                                            field.onChange(updatedSizes);
                                                        }}
                                                    >
                                                        <Trash size={15} color={"red"} />
                                                    </button>
                                                </div>
                                            ))} */}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />


                        {/* <FormField
                            control={form.control}
                            name="sizes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sizes</FormLabel>
                                    <Select
                                        disabled={loading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={"field.value"}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue defaultValue={field.value} placeholder="Select sizes" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {field.value.map((size) => (
                                                <div className="flex items-center gap-x-1">
                                                    {size.value} -
                                                    <input
                                                        type="checkbox"
                                                        value={sizes[size.value] || false}
                                                        checked={sizes[size.value] || false}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setSizes((prevSizes) => ({
                                                                ...prevSizes,
                                                                [size.value]: checked,
                                                            }));
                                                            console.log(size.value, checked);
                                                            size.inStock = checked;
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )} /> */}

                        {/* <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select
                                        disabled={loading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue defaultValue={field.value} placeholder="Select a category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} /> */}

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Category" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        {/* 
                        <FormField
                            control={form.control}
                            name="sizeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Size</FormLabel>
                                    <Select
                                        disabled={loading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue defaultValue={field.value} placeholder="Select a size" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {sizes.map((size) => (
                                                <SelectItem key={size.id} value={size.id}>
                                                    {size.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} /> */}

                        {/* <FormField
                            control={form.control}
                            name="colorId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <Select
                                        disabled={loading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue defaultValue={field.value} placeholder="Select a size" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {colors.map((color) => (
                                                <SelectItem key={color.id} value={color.id}>
                                                    {color.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} /> */}

                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Color" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                        <FormField
                            control={form.control}
                            name="isFeatured"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            // @ts-ignore
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Featured
                                        </FormLabel>
                                        <FormDescription>
                                            This product will appear on the home page.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )} />

                        <FormField
                            control={form.control}
                            name="isArchived"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            // @ts-ignore
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Archived
                                        </FormLabel>
                                        <FormDescription>
                                            This product will not appear anywhere in the store.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )} />
                    </div>
                    <Button disabled={loading} className="ml-auto" type="submit">
                        {action}
                    </Button>
                </form>
            </Form>
        </>
    );
};