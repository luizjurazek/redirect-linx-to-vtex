const fs = require("fs")
const csvtojson = require("csvtojson")

// Path do csv 
const produtosVTEXCSV = './csv/produtos.csv'
const produtosLINXCSV = './csv/internal_all-venture.csv'

// Variável global para armazenar os produtos
let arrayProdutosVTEX = []
let arrayProdutosLINX = []

// Converter CSV em JSON
async function converterCSVparaJSON(path) {
    try {
        const jsonArray = await csvtojson().fromFile(path);
        return jsonArray
    } catch (error) {
        console.error("Erro ao converter o CSV para JSON: ", error)
        return [];
    }
}


// Obter apenas os campos necessários dos produtos VTEX que estão no CSV 
async function obterProdutosVTEX(path) {
    try {
        const JSONProdutos = await converterCSVparaJSON(path)
        arrayProdutosVTEX = []; // Limpa o array antes de preenchê-lo novamente

        for (let i = 0; i < 2; i++) {
            const produto = JSONProdutos[i];
            arrayProdutosVTEX.push({
                Nome: produto['_NomeProduto (Obrigatório)'],
                Categoria: produto['_IDCategoria'],
                SKU: produto['_IDSKU (Não alterável)'],
                link: produto['_LinkTexto (Não alterável)']
            })
        }
        return arrayProdutosVTEX
    } catch(erro){
        console.error(erro)
    }
}

// Obter apenas os campos necessários dos produtos LINX que estão no CSV 
async function obterProdutosLINX(path) {
    try {
        const JSONProdutos = await converterCSVparaJSON(path)
        arrayProdutosLINX = []; // Limpa o array antes de preenchê-lo novamente

        for (let i = 0; i < 3; i++) {
            const produto = JSONProdutos[i];

            // Expressão regular para extrair o sku
            let skuMatch = produto['Address'].match(/-(\d+)-/)

            // Adiciona o dados do produtos em um array de objetos
            arrayProdutosLINX.push({
                Nome: produto['Title 1'],
                link: produto['Address'],
                skuProduto: parseInt(skuMatch ? skuMatch[1] : null), // Capturar o SKU se Match for encontrado, aplica null se não
            })
        }
        return arrayProdutosLINX;
    } catch(erro){
        console.error(erro)
    }
}

// obterProdutosVTEX(produtosVTEXCSV).then((result) => {
//     console.log(result)
// }).catch((erro) =>{
//     console.log(erro)
// })

obterProdutosLINX(produtosLINXCSV).then((result) => {
    console.log(result)
}).catch((erro) =>{
    console.log(erro)
})


console.log(produtosLINXCSV)