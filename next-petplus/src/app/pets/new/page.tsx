import { redirect } from 'next/navigation';

export default function PetsNewPage() {
  redirect('/pets/edit/new');
}
