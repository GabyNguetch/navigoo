import { ChangeEvent } from "react";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  imagePreview: string | null;
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export const ImageUpload = ({ imagePreview, onImageChange, onRemove }: ImageUploadProps) => {
  return (
    <div>
       <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1 block">
        Photo principale
      </label>
      {imagePreview ? (
        <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-md group">
          <Image src={imagePreview} alt="Preview" fill className="object-cover" />
          <button type="button" onClick={onRemove} className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors">
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-violet-50 dark:hover:bg-zinc-800/50 hover:border-primary/50 transition-all group">
          <div className="p-3 bg-white dark:bg-zinc-800 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
            <ImagePlus size={24} className="text-zinc-400 group-hover:text-primary" />
          </div>
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Ajouter une photo</span>
          <input type="file" className="hidden" accept="image/*" onChange={onImageChange} />
        </label>
      )}
    </div>
  );
};