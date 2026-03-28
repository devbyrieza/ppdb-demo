import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertProps {
    type?: "success" | "error" | "warning" | "info";
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export default function Alert({
    type = "info",
    title,
    children,
    className
}: AlertProps) {

    const variants = {
        success: {
            container: "bg-emerald-50 border-emerald-200 text-emerald-800",
            icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
            title: "text-emerald-900"
        },
        error: {
            container: "bg-red-50 border-red-200 text-red-800",
            icon: <XCircle className="w-5 h-5 text-red-600" />,
            title: "text-red-900"
        },
        warning: {
            container: "bg-amber-50 border-amber-200 text-amber-800",
            icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
            title: "text-amber-900"
        },
        info: {
            container: "bg-blue-50 border-blue-200 text-blue-800",
            icon: <Info className="w-5 h-5 text-blue-600" />,
            title: "text-blue-900"
        }
    };

    const variant = variants[type];

    return (
        <div className={cn("p-4 rounded-xl border flex gap-3", variant.container, className)}>
            <div className="shrink-0 mt-0.5">
                {variant.icon}
            </div>
            <div>
                {title && <h4 className={cn("font-bold mb-1", variant.title)}>{title}</h4>}
                <div className="text-sm">
                    {children}
                </div>
            </div>
        </div>
    );
}
