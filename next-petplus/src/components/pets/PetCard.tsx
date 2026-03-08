import Image from "next/image";
import { Pet } from "@/types";
import { getSpeciesIcon, getAgeLabel, getSizeLabel } from "@/lib/helpers";

interface PetCardProps {
  pet: Pet;
  onAdotar?: (id: number) => void;
}

export default function PetCard({ pet, onAdotar }: PetCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      {pet.photoUrl ? (
        <Image
          src={pet.photoUrl}
          alt={pet.name}
          width={300}
          height={200}
          className="rounded-md object-cover w-full h-48"
        />
      ) : (
        <div className="w-full h-48 rounded-md bg-muted flex items-center justify-center text-5xl">
          {getSpeciesIcon(pet.species)}
        </div>
      )}
      <h3 className="mt-2 text-lg font-semibold">{pet.name}</h3>
      <p className="text-sm text-muted-foreground">{pet.breed} · {getAgeLabel(pet.age)} · {getSizeLabel(pet.size)}</p>
      <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{pet.description}</p>
      {onAdotar && (
        <button
          onClick={() => onAdotar(pet.id)}
          className="mt-3 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 w-full"
        >
          Adotar
        </button>
      )}
    </div>
  );
}