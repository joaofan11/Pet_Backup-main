"use client";
import { useEffect, useState } from "react";
import { getPets } from "@/lib/api";
import PetCard from "@/components/pets/PetCard";
import { Pet } from "@/types/pet";

export default function AdocaoPage() {
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    getPets().then(setPets);
  }, []);

  return (
    <div className="container mx-auto grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
      {pets.map((pet) => (
        <PetCard key={pet.id} pet={pet} onAdotar={(id) => console.log(id)} />
      ))}
    </div>
  );
}
