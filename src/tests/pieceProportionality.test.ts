/**
 * Testes de Proporcionalidade das Peças Podais
 * Valida que as peças mantêm proporção correta ao escalar para diferentes tamanhos
 */

import { pieceDimensionsService } from '../services/pieceDimensionsService';
import { getFootLengthFromShoeSize } from '../services/insoleMeasurementsService';

interface ProportionalityTest {
  pieceId: string;
  shoeSizes: number[];
  expectedProportions: {
    widthToDepthRatio: number;
    tolerance: number;
  };
}

export class PieceProportionalityTest {
  /**
   * Testa se as peças mantêm proporção ao escalar
   */
  public static async testProportionality(): Promise<boolean> {
    console.log('🧪 Testando Proporcionalidade das Peças Podais');
    console.log('=============================================\n');

    let testsPassed = 0;
    let totalTests = 0;

    // Peças de teste com diferentes proporções
    const testPieces: ProportionalityTest[] = [
      {
        pieceId: 'p-ARCP-A',
        shoeSizes: [35, 38, 41, 44, 48],
        expectedProportions: {
          widthToDepthRatio: 8 / 12, // width: 8cm, depth: 12cm
          tolerance: 0.05 // 5% de tolerância
        }
      },
      {
        pieceId: 'p-SUPPLEMENT-L',
        shoeSizes: [35, 38, 41, 44, 48],
        expectedProportions: {
          widthToDepthRatio: 10 / 15, // width: 10cm, depth: 15cm
          tolerance: 0.05
        }
      },
      {
        pieceId: 'p1g',
        shoeSizes: [35, 38, 41, 44, 48],
        expectedProportions: {
          widthToDepthRatio: 4 / 6, // width: 4cm, depth: 6cm
          tolerance: 0.05
        }
      }
    ];

    for (const test of testPieces) {
      totalTests++;
      const piece = await pieceDimensionsService.getPieceDimensions(test.pieceId);
      
      if (!piece) {
        console.log(`❌ Teste ${totalTests}: Peça ${test.pieceId} não encontrada`);
        continue;
      }

      const baseRatio = test.expectedProportions.widthToDepthRatio;
      const tolerance = test.expectedProportions.tolerance;
      let allProportionsValid = true;
      const ratios: number[] = [];

      for (const shoeSize of test.shoeSizes) {
        const scale = pieceDimensionsService.calculateRealScale(shoeSize, piece);
        const ratio = scale.width / scale.height;
        ratios.push(ratio);

        const expectedRatio = baseRatio;
        const difference = Math.abs(ratio - expectedRatio);
        const isWithinTolerance = difference <= (expectedRatio * tolerance);

        if (!isWithinTolerance) {
          allProportionsValid = false;
          console.log(`  ⚠️ Tamanho ${shoeSize}: Razão ${ratio.toFixed(3)} (esperado: ${expectedRatio.toFixed(3)} ± ${(expectedRatio * tolerance).toFixed(3)})`);
        }
      }

      if (allProportionsValid) {
        console.log(`✅ Teste ${totalTests}: ${test.pieceId} mantém proporção em todos os tamanhos`);
        console.log(`   Razões: ${ratios.map(r => r.toFixed(3)).join(', ')}`);
        testsPassed++;
      } else {
        console.log(`❌ Teste ${totalTests}: ${test.pieceId} não mantém proporção correta`);
      }
    }

    console.log(`\n📊 Resultado: ${testsPassed}/${totalTests} testes passaram\n`);
    return testsPassed === totalTests;
  }

  /**
   * Testa se a escala aumenta proporcionalmente com o tamanho do calçado
   */
  public static async testScaleProgression(): Promise<boolean> {
    console.log('🧪 Testando Progressão de Escala');
    console.log('================================\n');

    let testsPassed = 0;
    let totalTests = 0;

    const testPieceId = 'p-ARCP-A';
    const piece = await pieceDimensionsService.getPieceDimensions(testPieceId);

    if (!piece) {
      console.log('❌ Peça de teste não encontrada');
      return false;
    }

    const shoeSizes = [35, 38, 41, 44, 48];
    const scales: number[] = [];
    const footLengths: number[] = [];

    for (const size of shoeSizes) {
      const footLength = getFootLengthFromShoeSize(size);
      const scale = pieceDimensionsService.calculateRealScale(size, piece);
      
      footLengths.push(footLength);
      scales.push(scale.scale);
      
      console.log(`  Tamanho ${size}: Pé ${footLength.toFixed(1)}cm → Escala ${scale.scale.toFixed(4)}`);
    }

    // Verificar se a escala aumenta proporcionalmente ao comprimento do pé
    totalTests++;
    let isProportional = true;
    for (let i = 1; i < scales.length; i++) {
      const scaleRatio = scales[i] / scales[i - 1];
      const lengthRatio = footLengths[i] / footLengths[i - 1];
      const difference = Math.abs(scaleRatio - lengthRatio);
      
      if (difference > 0.01) { // Tolerância de 1%
        isProportional = false;
        console.log(`  ⚠️ Desproporção detectada entre tamanhos ${shoeSizes[i-1]} e ${shoeSizes[i]}`);
      }
    }

    if (isProportional) {
      console.log('✅ Progressão de escala é proporcional ao comprimento do pé\n');
      testsPassed++;
    } else {
      console.log('❌ Progressão de escala não é proporcional\n');
    }

    // Verificar se tamanhos maiores resultam em escalas maiores
    totalTests++;
    let isIncreasing = true;
    for (let i = 1; i < scales.length; i++) {
      if (scales[i] <= scales[i - 1]) {
        isIncreasing = false;
        break;
      }
    }

    if (isIncreasing) {
      console.log('✅ Escala aumenta corretamente com o tamanho do calçado\n');
      testsPassed++;
    } else {
      console.log('❌ Escala não aumenta corretamente\n');
    }

    console.log(`📊 Resultado: ${testsPassed}/${totalTests} testes passaram\n`);
    return testsPassed === totalTests;
  }

  /**
   * Testa dimensões em tamanhos extremos
   */
  public static async testExtremeSizes(): Promise<boolean> {
    console.log('🧪 Testando Tamanhos Extremos');
    console.log('============================\n');

    let testsPassed = 0;
    let totalTests = 0;

    const testPieceId = 'p-ARCP-A';
    const piece = await pieceDimensionsService.getPieceDimensions(testPieceId);

    if (!piece) {
      console.log('❌ Peça de teste não encontrada');
      return false;
    }

    const extremeSizes = [32, 48]; // Menor e maior tamanho comum

    for (const size of extremeSizes) {
      totalTests++;
      try {
        const scale = pieceDimensionsService.calculateRealScale(size, piece);
        const footLength = getFootLengthFromShoeSize(size);

        // Verificar se as dimensões são válidas (positivas e não infinitas)
        const isValid = 
          scale.width > 0 && 
          scale.height > 0 && 
          scale.scale > 0 &&
          isFinite(scale.width) &&
          isFinite(scale.height) &&
          isFinite(scale.scale);

        if (isValid) {
          console.log(`✅ Tamanho ${size} (${footLength.toFixed(1)}cm): Dimensões válidas`);
          console.log(`   Largura: ${scale.width.toFixed(1)}px, Altura: ${scale.height.toFixed(1)}px, Escala: ${scale.scale.toFixed(4)}`);
          testsPassed++;
        } else {
          console.log(`❌ Tamanho ${size}: Dimensões inválidas`);
        }
      } catch (error) {
        console.log(`❌ Tamanho ${size}: Erro ao calcular escala - ${error}`);
      }
    }

    console.log(`\n📊 Resultado: ${testsPassed}/${totalTests} testes passaram\n`);
    return testsPassed === totalTests;
  }

  /**
   * Valida se as dimensões base estão corretas
   */
  public static async validateBaseDimensions(): Promise<boolean> {
    console.log('🧪 Validando Dimensões Base');
    console.log('==========================\n');

    let testsPassed = 0;
    let totalTests = 0;

    // Peças com dimensões conhecidas para validação
    const expectedDimensions: Array<{
      pieceId: string;
      expectedWidth: number;
      expectedDepth: number;
      expectedThickness: number;
      tolerance: number;
    }> = [
      {
        pieceId: 'p-ARCP-A',
        expectedWidth: 8,
        expectedDepth: 12,
        expectedThickness: 3,
        tolerance: 0.1
      },
      {
        pieceId: 'p-SUPPLEMENT-L',
        expectedWidth: 10,
        expectedDepth: 15,
        expectedThickness: 2,
        tolerance: 0.1
      },
      {
        pieceId: 'p1g',
        expectedWidth: 4,
        expectedDepth: 6,
        expectedThickness: 3,
        tolerance: 0.1
      }
    ];

    for (const expected of expectedDimensions) {
      totalTests++;
      const piece = await pieceDimensionsService.getPieceDimensions(expected.pieceId);

      if (!piece) {
        console.log(`❌ Teste ${totalTests}: Peça ${expected.pieceId} não encontrada`);
        continue;
      }

      const widthOk = Math.abs(piece.width - expected.expectedWidth) <= expected.tolerance;
      const depthOk = Math.abs(piece.depth - expected.expectedDepth) <= expected.tolerance;
      const thicknessOk = Math.abs(piece.thickness - expected.expectedThickness) <= expected.tolerance;

      if (widthOk && depthOk && thicknessOk) {
        console.log(`✅ Teste ${totalTests}: ${expected.pieceId} - Dimensões corretas`);
        console.log(`   ${piece.width}cm x ${piece.depth}cm x ${piece.thickness}mm`);
        testsPassed++;
      } else {
        console.log(`❌ Teste ${totalTests}: ${expected.pieceId} - Dimensões incorretas`);
        console.log(`   Esperado: ${expected.expectedWidth}cm x ${expected.expectedDepth}cm x ${expected.expectedThickness}mm`);
        console.log(`   Obtido: ${piece.width}cm x ${piece.depth}cm x ${piece.thickness}mm`);
      }
    }

    console.log(`\n📊 Resultado: ${testsPassed}/${totalTests} testes passaram\n`);
    return testsPassed === totalTests;
  }

  /**
   * Executa todos os testes de proporcionalidade
   */
  public static async runAllTests(): Promise<boolean> {
    console.log('🚀 INICIANDO TESTES DE PROPORCIONALIDADE');
    console.log('========================================\n');

    const proportionalityTest = await this.testProportionality();
    const scaleProgressionTest = await this.testScaleProgression();
    const extremeSizesTest = await this.testExtremeSizes();
    const baseDimensionsTest = await this.validateBaseDimensions();

    const allTestsPassed = 
      proportionalityTest && 
      scaleProgressionTest && 
      extremeSizesTest && 
      baseDimensionsTest;

    console.log('🎯 RESULTADO FINAL DOS TESTES');
    console.log('============================');
    console.log(`Proporcionalidade: ${proportionalityTest ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`Progressão de escala: ${scaleProgressionTest ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`Tamanhos extremos: ${extremeSizesTest ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`Dimensões base: ${baseDimensionsTest ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`\nResultado geral: ${allTestsPassed ? '✅ TODOS OS TESTES PASSARAM' : '❌ ALGUNS TESTES FALHARAM'}\n`);

    return allTestsPassed;
  }
}

// Exportar para uso em outros arquivos
export default PieceProportionalityTest;
