import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  Botao,
  CabecalhoTela,
  Campo,
  EstadoErro,
  SeletorSegmentado,
  SheetConfirmar,
  SkeletonFicha,
  Tela,
} from '@/components/ui';
import type { OpcaoSegmento } from '@/components/ui';
import { useAviso } from '@/features/aviso/AvisoContext';
import { atualizarExecucao, buscarExecucao, criarExecucao } from '@/features/execucoes/repositorio';
import { useDonoDosDados } from '@/features/execucoes/useDonoDosDados';
import { emNumero, type ErrosFicha, validarFicha } from '@/features/execucoes/validacao';
import { useCarregamento } from '@/hooks/useCarregamento';
import { useErrosFormulario } from '@/hooks/useErrosFormulario';
import { spacing, text } from '@/theme';
import { semErros } from '@/utils/validacao';

/** Meias notas chegam com a ficha preenchida por áudio; aqui são os cinco passos. */
const NOTAS: OpcaoSegmento<'1' | '2' | '3' | '4' | '5'>[] = [
  { valor: '1', rotulo: '1' },
  { valor: '2', rotulo: '2' },
  { valor: '3', rotulo: '3' },
  { valor: '4', rotulo: '4' },
  { valor: '5', rotulo: '5' },
];

type Nota = (typeof NOTAS)[number]['valor'];

const VAZIA = { prato: '', tempo: '', custo: '', qualidade: '', defeito: '' };

export default function TelaFicha() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const dono = useDonoDosDados();
  const aviso = useAviso();

  const editando = Boolean(id);
  const [campos, setCampos] = useState(VAZIA);
  const [nota, setNota] = useState<Nota>('3');
  const [mexeu, setMexeu] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);
  // Removida em outra tela enquanto esta estava aberta.
  const [sumiu, setSumiu] = useState(false);
  const { erros, definirErros, limparErro } = useErrosFormulario<ErrosFicha>();

  // Só busca quando há id: criar não espera o banco por nada.
  const { estado, dados: original, recarregar } = useCarregamento(
    () => (id ? buscarExecucao(id, dono) : Promise.resolve(null)),
    [id, dono],
  );

  // Preenche uma vez, quando a execução chega. Depois disso quem manda é o que
  // o usuário digitou — reaplicar aqui apagaria a edição em andamento.
  useEffect(() => {
    if (!original) return;

    setCampos({
      prato: original.prato,
      tempo: String(minutosDe(original.tempo)),
      custo: String(original.custo).replace('.', ','),
      qualidade: original.chips.find((chip) => chip.tipo === 'qualidade')?.texto ?? '',
      defeito: original.chips.find((chip) => chip.tipo === 'defeito')?.texto ?? '',
    });
    setNota(notaMaisProxima(original.nota));
  }, [original]);

  function mudar(campo: keyof typeof VAZIA, valor: string) {
    setCampos((atuais) => ({ ...atuais, [campo]: valor }));
    setMexeu(true);
    if (campo === 'prato' || campo === 'tempo' || campo === 'custo') limparErro(campo);
  }

  function tentarSair() {
    // Nada digitado não é nada a perder: a confirmação seria só um obstáculo.
    if (!mexeu) return router.back();
    setConfirmandoSaida(true);
  }

  async function salvar() {
    const encontrados = validarFicha(campos);
    definirErros(encontrados);
    if (!semErros(encontrados)) return;

    setSalvando(true);
    const comum = {
      tempoMinutos: emNumero(campos.tempo) ?? 0,
      custo: emNumero(campos.custo) ?? 0,
      nota: Number(nota),
      qualidade: campos.qualidade,
      defeito: campos.defeito,
    };

    try {
      // `atualizarExecucao` devolve null, sem lançar, quando o id deixou de
      // existir enquanto esta tela estava aberta. Ignorar isso seria anunciar
      // sucesso sem ter gravado nada.
      if (id) {
        const alterada = await atualizarExecucao(dono, id, comum);
        if (!alterada) {
          setSalvando(false);
          setSumiu(true);
          return;
        }
      } else {
        await criarExecucao(dono, { ...comum, prato: campos.prato });
      }
    } catch {
      setSalvando(false);
      // Pelo aviso, e não por erro de campo: na edição o campo `prato` não
      // está na árvore, e a falha ficaria invisível. O aviso também anuncia.
      aviso.mostrar({ texto: 'não consegui salvar. tente de novo.', tom: 'erro' });
      return;
    }

    router.back();
    aviso.mostrar({ texto: editando ? 'ficha atualizada' : 'execução registrada' });
  }

  const carregando = editando && estado === 'carregando';
  const naoEncontrada = sumiu || (editando && estado === 'pronto' && !original);

  return (
    <Tela edges={['top']}>
      <CabecalhoTela
        titulo={editando ? 'editar execução' : 'nova execução'}
        origem={editando ? 'a execução' : 'onde você estava'}
        onVoltar={tentarSair}
      />

      {carregando ? (
        <View style={estilos.margem}>
          <SkeletonFicha quantidade={2} />
        </View>
      ) : null}

      {editando && estado === 'erro' ? (
        <EstadoErro
          titulo="não consegui abrir esta ficha"
          descricao="sua execução continua salva. pode ser o armazenamento do aparelho."
          acao={{ rotulo: 'tentar de novo', onPress: recarregar }}
        />
      ) : null}

      {naoEncontrada ? (
        <EstadoErro
          titulo="não encontrei esta execução"
          descricao="ela pode ter sido removida enquanto esta tela estava aberta."
          acao={{ rotulo: 'voltar', onPress: () => router.back() }}
        />
      ) : null}

      {!carregando && !naoEncontrada && estado !== 'erro' ? (
        <ScrollView
          contentContainerStyle={estilos.rolagem}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Editar não troca o prato: mudaria a execução de série de tentativas. */}
          {editando ? (
            <View style={estilos.pratoFixo}>
              <Text style={[text.overline, estilos.rotulo]}>prato</Text>
              <Text style={text.sectionTitle}>{campos.prato}</Text>
              <Text style={[text.dataMeta, estilos.explicacao]}>
                a tentativa {original?.tentativa} de {campos.prato}. o prato não muda: ele é o
                que mantém a contagem de tentativas.
              </Text>
            </View>
          ) : (
            <Campo
              rotulo="prato"
              placeholder="bolo de cenoura"
              dica="o mesmo nome agrupa as tentativas do mesmo prato"
              value={campos.prato}
              erro={erros.prato}
              onChangeText={(valor) => mudar('prato', valor)}
              autoCapitalize="sentences"
            />
          )}

          <Campo
            rotulo="tempo"
            placeholder="65"
            dica="em minutos"
            keyboardType="number-pad"
            value={campos.tempo}
            erro={erros.tempo}
            onChangeText={(valor) => mudar('tempo', valor)}
            containerStyle={estilos.campo}
          />

          <Campo
            rotulo="custo"
            placeholder="12,80"
            dica="o que gastou em ingredientes, em reais"
            keyboardType="decimal-pad"
            value={campos.custo}
            erro={erros.custo}
            onChangeText={(valor) => mudar('custo', valor)}
            containerStyle={estilos.campo}
          />

          <View style={estilos.campo}>
            <Text style={[text.overline, estilos.rotulo]} accessibilityRole="header">
              nota
            </Text>
            <SeletorSegmentado
              opcoes={NOTAS}
              valor={nota}
              onChange={(valor) => {
                setNota(valor);
                setMexeu(true);
              }}
            />
          </View>

          <Campo
            rotulo="o que deu certo"
            placeholder="massa fofa"
            dica="opcional. vira um chip de qualidade na ficha"
            value={campos.qualidade}
            onChangeText={(valor) => mudar('qualidade', valor)}
            containerStyle={estilos.campo}
          />

          <Campo
            rotulo="o que deu errado"
            placeholder="massa crua no meio"
            dica="opcional. vira um chip de defeito, e é o que o app passa a acompanhar"
            value={campos.defeito}
            onChangeText={(valor) => mudar('defeito', valor)}
            containerStyle={estilos.campo}
          />

          {/* Única ação âmbar da tela: aqui não existe a barra de abas. */}
          <Botao
            titulo={editando ? 'salvar alterações' : 'salvar execução'}
            onPress={salvar}
            carregando={salvando}
            style={estilos.salvar}
            accessibilityHint={
              editando
                ? 'grava as alterações e volta para a execução'
                : 'grava a execução no aparelho e volta'
            }
          />
        </ScrollView>
      ) : null}

      <SheetConfirmar
        visivel={confirmandoSaida}
        titulo={editando ? 'descartar as alterações?' : 'descartar esta ficha?'}
        descricao="o que você digitou aqui não foi salvo, e sair agora o apaga."
        rotuloConfirmar="descartar e sair"
        onConfirmar={() => {
          setConfirmandoSaida(false);
          router.back();
        }}
        onCancelar={() => setConfirmandoSaida(false)}
      />
    </Tela>
  );
}

/** "1h05" -> 65, "55 min" -> 55. O inverso de `formatarTempo`, para preencher. */
function minutosDe(tempo: string): number {
  const comHora = tempo.match(/^(\d+)h(\d{2})?$/);
  if (comHora) return Number(comHora[1]) * 60 + Number(comHora[2] ?? 0);

  const soMinutos = tempo.match(/^(\d+)/);
  return soMinutos ? Number(soMinutos[1]) : 0;
}

/** O seletor tem cinco passos; uma nota 4,5 vinda do áudio cai no mais perto. */
function notaMaisProxima(nota: number): Nota {
  const inteira = Math.min(5, Math.max(1, Math.round(nota)));
  return String(inteira) as Nota;
}

const estilos = StyleSheet.create({
  margem: { paddingHorizontal: spacing.screenH, paddingTop: spacing.md },
  rolagem: {
    paddingHorizontal: spacing.screenH,
    paddingTop: spacing.md,
    paddingBottom: spacing.huge,
  },
  pratoFixo: { marginBottom: spacing.xs },
  rotulo: { marginBottom: spacing.xs },
  explicacao: { marginTop: spacing.xs },
  campo: { marginTop: spacing.lg },
  salvar: { marginTop: spacing.xxl },
});
