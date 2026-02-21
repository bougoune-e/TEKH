
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shared/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select";
import { Checkbox } from "@/shared/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/ui/dialog";
import { toast } from "sonner";
import { fetchBrands, fetchModels, fetchStorages, insertDealbox } from "@/core/api/supabaseApi";

const defaultCertifications = {
    data_wipe: true,
    diagnostic_50_pts: true,
    batterie_certifiee: true,
};

const formSchema = z.object({
    brand: z.string().min(1, "La marque est requise"),
    model: z.string().min(1, "Le modèle est requis"),
    storage: z.string().transform((val) => Number(val)),
    price: z.coerce.number().min(5000, "Prix minimum 5000 FCFA"),
    type_box: z.enum(["KING", "QUEEN"]),
    certifications: z.object({
        data_wipe: z.boolean().default(true),
        diagnostic_50_pts: z.boolean().default(true),
        batterie_certifiee: z.boolean().default(true),
    }),
    expiration_date: z.string().refine((date) => new Date(date) > new Date(), {
        message: "La date d'expiration doit être future",
    }),
});

interface DealboxFormProps {
    onSuccess?: () => void;
    trigger?: React.ReactNode;
}

export function DealboxForm({ onSuccess, trigger }: DealboxFormProps) {
    const [open, setOpen] = useState(false);
    const [brands, setBrands] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [storages, setStorages] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            brand: "",
            model: "",
            storage: 0,
            price: 0,
            type_box: "KING",
            certifications: defaultCertifications,
            expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0], // Default 7 days
        },
    });

    const watchedBrand = form.watch("brand");
    const watchedModel = form.watch("model");

    // Load Brands on mount
    useEffect(() => {
        fetchBrands().then(setBrands);
    }, []);

    // Load Models when Brand changes
    useEffect(() => {
        if (watchedBrand) {
            fetchModels(watchedBrand).then((data) => {
                setModels(data);
                form.setValue("model", ""); // Reset model
                setStorages([]);
            });
        }
    }, [watchedBrand, form]);

    // Load Storages when Model changes
    useEffect(() => {
        if (watchedBrand && watchedModel) {
            fetchStorages(watchedBrand, watchedModel).then((data) => {
                setStorages(data);
                if (data.length > 0) form.setValue("storage", data[0]);
            });
        }
    }, [watchedBrand, watchedModel, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            await insertDealbox({
                modele: `${values.brand} ${values.model}`,
                stockage: values.storage,
                prix_dealbox: values.price,
                type_box: values.type_box,
                certifications: values.certifications,
                expiration_date: new Date(values.expiration_date).toISOString(),
                status: "available",
            });
            toast.success("Dealbox créée avec succès !");
            setOpen(false);
            form.reset();
            onSuccess?.();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la création de la Dealbox");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>Nouvelle Dealbox</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Ajouter une Dealbox</DialogTitle>
                    <DialogDescription>
                        Ajoutez un nouveau produit certifié au stock.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {/* Brand */}
                        <FormField
                            control={form.control}
                            name="brand"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Marque</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner une marque" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {brands.map((b) => (
                                                <SelectItem key={b} value={b}>
                                                    {b}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Model */}
                        <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Modèle</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={!models.length}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={models.length ? "Sélectionner un modèle" : "Aucun modèle disponible"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {models.map((m) => (
                                                <SelectItem key={m} value={m}>
                                                    {m}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Storage */}
                        <FormField
                            control={form.control}
                            name="storage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stockage (Go)</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        defaultValue={String(field.value)}
                                        disabled={!storages.length}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={storages.length ? "Sélectionner stockage" : "Aucun stockage"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {storages.map((s) => (
                                                <SelectItem key={s} value={String(s)}>
                                                    {s} Go
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            {/* Type Box */}
                            <FormField
                                control={form.control}
                                name="type_box"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type de Box</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="KING">KING (Premium)</SelectItem>
                                                <SelectItem value="QUEEN">QUEEN (Standard)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Price */}
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prix (FCFA)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Certifications */}
                        <div className="space-y-2 border p-4 rounded-md">
                            <FormLabel>Certifications Incluses</FormLabel>
                            <FormField
                                control={form.control}
                                name="certifications.data_wipe"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal">Effacement Données</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="certifications.diagnostic_50_pts"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal">Diagnostic 50 Points</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="certifications.batterie_certifiee"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal">Batterie Certifiée ({">"}85%)</FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Date Expiration */}
                        <FormField
                            control={form.control}
                            name="expiration_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date d'expiration de l'offre</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Création..." : "Créer Dealbox"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
