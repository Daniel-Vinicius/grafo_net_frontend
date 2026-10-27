export async function verificarHealth() {
  const resposta = await fetch('/health')

  if (!resposta.ok) {
    throw new Error(`Erro HTTP ${resposta.status}`)
  }

  const dados = await resposta.json()
  return dados
}