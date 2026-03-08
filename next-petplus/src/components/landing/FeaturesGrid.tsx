// src/components/landing/FeaturesGrid.tsx

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: '🏠',
    title: 'Encontre um Lar',
    description:
      'Milhares de animais esperando uma família amorosa. Use nossos filtros avançados para encontrar o companheiro perfeito para você e sua família.',
  },
  {
    icon: '❤️',
    title: 'Doe com Amor',
    description:
      'Ajude um animal a encontrar uma nova família. Cadastre pets para adoção de forma simples e acompanhe todo o processo.',
  },
  {
    icon: '📱',
    title: 'Carteira Digital',
    description:
      'Mantenha o histórico completo de vacinas, consultas e medicamentos dos seus pets sempre organizado e acessível.',
  },
  {
    icon: '🩺',
    title: 'Serviços',
    description:
      'Encontre tudo o que seu pet precisa em um só lugar: hospedagem, creche, pet sitter, banho e tosa profissionais e clínicas para garantir bem-estar e felicidade.',
  },
];

export function FeaturesGrid() {
  return (
    <section className="grid grid-cols-1 gap-10 bg-gradient-to-b from-[#f7fafc] to-[#edf2f7] px-10 py-20 sm:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map((feature) => (
        <article
          key={feature.title}
          className="rounded-[20px] border border-black/5 bg-white px-8 py-12 text-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
        >
          <span className="mb-6 block text-[4rem]">{feature.icon}</span>
          <h3 className="mb-4 text-xl font-bold text-[#2d3748]">{feature.title}</h3>
          <p className="text-[0.95rem] leading-relaxed text-[#718096]">{feature.description}</p>
        </article>
      ))}
    </section>
  );
}
