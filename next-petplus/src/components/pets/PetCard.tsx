// src/components/PetCard.tsx
import Image from "next/image";
import { Pet } from "@/types/pet";

interface PetCardProps {
  pet: Pet;
  onAdotar: (id: number) => void;
}

export default function PetCard({ pet, onAdotar }: PetCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <Image
        src={pet.imagem_url}
        alt={pet.nome}
        width={300}
        height={200}
        className="rounded-md object-cover"
      />
      <h3 className="mt-2 text-lg font-semibold">{pet.nome}</h3>
      <p className="text-muted-foreground">{pet.descricao}</p>
      <button
        onClick={() => onAdotar(pet.id)}
        className="mt-3 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
      >
        Adotar
      </button>
    </div>
  );
}
