// Serve ao formulário de entrada e ao da ficha: por isso não mora em nenhum dos dois `features`
export const semErros = (erros: object): boolean => Object.keys(erros).length === 0;
