/** Nota (0–5) no padrão brasileiro: 4.5 -> "4,5". */
export const formatarNota = (nota: number): string =>
  nota.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Valor em reais: 12.8 -> "R$ 12,80". */
export const formatarMoeda = (valor: number): string =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Número de tentativa sempre com dois dígitos: 4 -> "04". */
export const formatarTentativa = (n: number): string => String(n).padStart(2, '0');

// Sempre cinco glifos, para a largura não dançar na lista.
export const estrelas = (nota: number): string => {
  const cheias = Math.max(0, Math.min(5, Math.round(nota)));
  return '★'.repeat(cheias) + '☆'.repeat(5 - cheias);
};

/** Data por extenso do cabeçalho de início: "segunda, 26 de agosto". */
export const dataPorExtenso = (data: Date): string =>
  data
    .toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace('-feira', '');

// Escrito à mão em vez de `toLocaleDateString`: a abreviação de mês do ICU
// varia entre o Hermes e o Node ("ago" aqui, "ago." ali), e a lista precisa
// bater exatamente com o `data` e o `mes` já guardados nas execuções.
const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

/** Tempo gasto a partir dos minutos: 65 -> "1h05", 55 -> "55 min", 60 -> "1h". */
export const formatarTempo = (minutos: number): string => {
  const inteiros = Math.max(0, Math.round(minutos));
  if (inteiros < 60) return `${inteiros} min`;
  const horas = Math.floor(inteiros / 60);
  const resto = inteiros % 60;
  return resto ? `${horas}h${String(resto).padStart(2, '0')}` : `${horas}h`;
};

/** Data curta da ficha: "19 ago". Sem ano — quem o carrega é `mes`. */
export const formatarDataCurta = (data: Date): string =>
  `${String(data.getDate()).padStart(2, '0')} ${MESES[data.getMonth()].slice(0, 3)}`;

/** Rótulo do período, como o histórico agrupa: "agosto de 2026". */
export const formatarMes = (data: Date): string =>
  `${MESES[data.getMonth()]} de ${data.getFullYear()}`;
