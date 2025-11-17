import prisma from '../database/client.js'
import { includeRelations } from '../lib/utils.js'

const controller = {}   // Objeto vazio

controller.create = async function(req, res) {
  try {
    // Cria o produto
    const novoProduto = await prisma.produto.create({ 
      data: req.body,
      include: {
        categoria: true,
        fornecedores: true
      }
    })

    res.status(201).send(novoProduto)
  }
  catch(error) {
    console.error(error)
    res.status(500).send(error)
  }
}

controller.retrieveAll = async function(req, res) {
  try {

    const include = includeRelations(req.query)

    // Manda buscar todas os produtos cadastradas no BD
    const result = await prisma.produto.findMany({
      include,
      orderBy: [ { nome: 'asc' }]  // Ordem ASCendente
    })

    // Retorna os dados obtidos ao cliente com o status
    // HTTP 200: OK (implícito)
    res.send(result)
  }
  catch(error) {
    // Algo deu errado: exibe o erro no terminal
    console.error(error)

    // Envia o erro ao front-end, com código de erro
    // HTTP 500: Internal Server Error
    res.status(500).send(error)
  }
}


controller.retrieveOne = async function(req, res) {
  try {

    const include = includeRelations(req.query)

    // Manda recuperar o documento no servidor de BD
    // usando como critério um id informado no parâmetro
    // da requisição
    const result = await prisma.produto.findUnique({
      include,
      where: { id: req.params.id }
    })

    // Encontrou o docuemento ~> retorna HTTP 200: OK (implícito)
    if(result) res.send(result)
    // Não encontrou o documento ~> retorna HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    // Algo deu errado: exibe o erro no terminal
    console.error(error)

    // Envia o erro ao front-end, com código de erro
    // HTTP 500: Internal Server Error
    res.status(500).send(error)
  }
}


controller.update = async function(req, res) {
  try {
    // Atualiza o produto
    const updatedProduto = await prisma.produto.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        categoria: true,
        fornecedores: true
      }
    })

    res.status(200).send(updatedProduto)
  }
  catch(error) {
    if(error?.code === 'P2025') {
      res.status(404).end()
    }
    else {
      console.error(error)
      res.status(500).send(error)
    }
  }
}

controller.delete = async function(req, res) {
  try {
    // Busca o documento a ser excluído pelo id passado
    // como parâmetro e efetua a exclusão, caso encontrado
    await prisma.produto.delete({
      where: { id: req.params.id }
    })

    // Encontrou e excluiu ~> retorna HTTP 204: No Content
    res.status(204).end()
  }
  catch(error) {
    // P2025: erro do Prisma referente a objeto não encontrado
    if(error?.code === 'P2025') {
      // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
      res.status(404).end()
    }
    else {    // Outros tipos de erro
      // Deu errado: exibe o erro no terminal
      console.error(error)

      // Envia o erro ao front-end, com status de erro
      // HTTP 500: Internal Server Error
      res.status(500).send(error)
    }
  }
}

export default controller