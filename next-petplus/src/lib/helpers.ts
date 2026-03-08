export function getSpeciesIcon(species: string) {
  const icons: Record<string, string> = { dog: '🐕', cat: '🐱' };
  return icons[species] || '🐾';
}

export function getAgeLabel(age: string) {
  const labels: Record<string, string> = { puppy: 'Filhote', young: 'Jovem', adult: 'Adulto', senior: 'Idoso' };
  return labels[age] || age;
}

export function getSizeLabel(size: string) {
  const labels: Record<string, string> = { small: 'Pequeno', medium: 'Médio', large: 'Grande' };
  return labels[size] || size;
}

export function getGenderLabel(gender: string) {
  return gender === 'male' ? 'Macho' : 'Fêmea';
}

export function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    vet: '🩺 Veterinários',
    sitter: '❤️ Cuidadores',
    walker: '🐕 Passeadores',
    transport: '🚐 Transporte Pet',
  };
  return labels[category] || category;
}

export function formatDate(date: string | undefined) {
  if (!date) return 'Data inválida';
  return new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export function formatDateTime(date: string | undefined) {
  if (!date) return 'Data inválida';
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isVaccineUpcoming(nextDate: string | null | undefined): boolean {
  if (!nextDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const next = new Date(nextDate);
  return next >= today && next <= thirtyDaysFromNow;
}
