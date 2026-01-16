// Script para verificar e corrigir o formato do token do PagBank
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

console.log('🔍 Verificando arquivo .env...\n');

if (!fs.existsSync(envPath)) {
  console.error('❌ Arquivo .env não encontrado!');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

console.log('📋 Conteúdo atual do PAGBANK_TOKEN:');
let tokenLine = null;
let tokenIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('PAGBANK_TOKEN=')) {
    tokenLine = lines[i];
    tokenIndex = i;
    console.log(`   Linha ${i + 1}: ${tokenLine.substring(0, 50)}...`);
    break;
  }
}

if (!tokenLine) {
  console.error('❌ PAGBANK_TOKEN não encontrado no .env');
  console.log('\n💡 Adicione a linha:');
  console.log('   PAGBANK_TOKEN=seu-token-aqui');
  process.exit(1);
}

// Extrair o token (tudo depois do =)
const tokenValue = tokenLine.split('=').slice(1).join('=').trim();

// Remover quebras de linha, espaços e caracteres especiais que podem ter sido copiados
const cleanToken = tokenValue
  .replace(/\r/g, '')
  .replace(/\n/g, '')
  .replace(/\s+/g, '')
  .replace(/-/g, '-') // Manter hífens
  .trim();

console.log('\n🔧 Token limpo:');
console.log(`   Primeiros 30 caracteres: ${cleanToken.substring(0, 30)}...`);
console.log(`   Últimos 30 caracteres: ...${cleanToken.substring(cleanToken.length - 30)}`);
console.log(`   Tamanho total: ${cleanToken.length} caracteres`);

// Verificar se o token parece válido (geralmente tokens têm um tamanho mínimo)
if (cleanToken.length < 20) {
  console.error('\n⚠️ ATENÇÃO: Token parece muito curto. Verifique se copiou o token completo.');
}

// Atualizar a linha no .env
lines[tokenIndex] = `PAGBANK_TOKEN=${cleanToken}`;
const newEnvContent = lines.join('\n');

// Fazer backup
const backupPath = envPath + '.backup';
fs.writeFileSync(backupPath, envContent);
console.log(`\n💾 Backup criado: ${backupPath}`);

// Salvar arquivo corrigido
fs.writeFileSync(envPath, newEnvContent);
console.log('✅ Arquivo .env atualizado com token corrigido!');
console.log('\n🧪 Agora você pode testar novamente com: node test-pagbank.js');
