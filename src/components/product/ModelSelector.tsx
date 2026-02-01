import React from "react";
import { cn } from "@/lib/utils";

interface Model {
    code: string;
    image: string;
    price?: number;
}

interface ModelSelectorProps {
    models: Model[];
    selectedModel: string;
    onSelect: (code: string) => void;
    showImages?: boolean;
    className?: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
    models,
    selectedModel,
    onSelect,
    showImages = true,
    className
}) => {
    if (!models || models.length === 0) return null;

    return (
        <div className={cn("mt-4", className)}>
            <h4 className="text-sm font-medium mb-2">Pilih Model:</h4>

            {/* Button Selection Grid */}
            <div className="grid grid-cols-3 gap-2 mb-2">
                {models.map((model) => (
                    <button
                        key={model.code}
                        onClick={() => onSelect(model.code)}
                        className={cn(
                            "px-2 py-1.5 rounded-lg text-xs transition-colors text-center border",
                            selectedModel === model.code
                                ? "bg-[#FF5E01] text-white border-[#FF5E01]"
                                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        )}
                    >
                        {model.code}
                    </button>
                ))}
            </div>

            {/* Image Thumbnails (Optional) */}
            {showImages && (
                <div className="mt-2">
                    <div className="grid grid-cols-8 gap-1.5 overflow-x-auto scrollbar-hide pb-2">
                        {models.map((model, index) => (
                            <div
                                key={`${model.code}-${index}`}
                                className={cn(
                                    "relative flex-shrink-0 w-8 h-8 rounded-md overflow-hidden cursor-pointer transition-all border",
                                    model.code === selectedModel
                                        ? "ring-2 ring-[#FF5E01] scale-105 border-[#FF5E01]"
                                        : "hover:scale-105 border-transparent"
                                )}
                                onClick={() => onSelect(model.code)}
                                title={model.code}
                            >
                                <img
                                    src={model.image}
                                    alt={`${model.code}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                    {models.length > 8 && (
                        <div className="text-center text-xs text-gray-500 mt-1">
                            +{models.length - 8} model lainnya tersedia
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
