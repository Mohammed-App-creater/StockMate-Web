export const formatMoney = (v: string | number) => `ETB ${Number(v).toFixed(2)}`;

export const formatDate = (v: string) => new Date(v).toLocaleDateString();
