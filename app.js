const fs = require("fs");
const csvtojson = require("csvtojson");
const {
    createObjectCsvWriter
} = require('csv-writer');

// Path do csv 
const produtosVTEXCSV = './csv/produtos.csv';
const produtosLINXCSV = './csv/produtos-venture.csv';
const caminhoArquivo = './csv/dados.csv';


// Variável global para armazenar os produtos
let produtosIguais = [];


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
        let arrayProdutosVTEX = []

        for (let i = 0; i < JSONProdutos.length; i++) {
            const produto = JSONProdutos[i];
            arrayProdutosVTEX.push({
                nome: produto['_NomeProduto (Obrigatório)'],
                // Categoria: produto['_IDCategoria'],
                link: produto['_LinkTexto (Não alterável)'],
                skuProduto: parseInt(produto['_IDSKU (Não alterável)'])
            })
        }
        return arrayProdutosVTEX
    } catch (erro) {
        console.error(erro)
    }
}

// Obter apenas os campos necessários dos produtos LINX que estão no CSV 
async function obterProdutosLINX(path) {
    try {

        const JSONProdutos = await converterCSVparaJSON(path)
        const regexForSkuInTheURL = /-(\d+)-/ // Regex para procurar a ocorrencia de sku na url do produto 
        let arrayProdutosLINX = []
        console.log()
        for (let i = 0; i < JSONProdutos.length; i++) {
            const produto = JSONProdutos[i];

            // Expressão regular para extrair o sku
            let skuMatch = produto['Address'].match(regexForSkuInTheURL)

            // Adiciona os dados do produto em um array de objetos
            arrayProdutosLINX.push({
                nome: produto['Title 1'],
                link: produto['Address'],
                skuProduto: parseInt(skuMatch ? skuMatch[1] : null), // Capturar o SKU se Match for encontrado, aplica null se não
            })
        }
        return arrayProdutosLINX;
    } catch (erro) {
        console.error(erro)
    }
}

// Array com as promises para usar no Promise.all e aguardar a resolucao das duas 
const promises = [obterProdutosVTEX(produtosVTEXCSV), obterProdutosLINX(produtosLINXCSV)]

//Promise.all para esperar que ambas as promises sejam resolvidas
Promise.all(promises).then(([produtosVTEX, produtosLINX]) => {
    compararArrays(produtosVTEX, produtosLINX)
}).catch((erro) => {
    console.error(erro)
})


// Compara dois array e re
function compararArrays(arr1, arr2) {
    let arrayUm = arr1;
    let arrayDois = arr2;
    // console.log(produtosVtex)
    // console.log(produtosLinx) 
    for (let i = 0; i < arrayUm.length; i++) {
        for (let j = 0; j < arrayDois.length; j++) {
            if (arrayUm[i].skuProduto == arrayDois[j].skuProduto) {
                produtosIguais.push({
                    Produto1: arrayUm[i],
                    Produto2: arrayDois[j]
                });
            }
        }
    }

    writeCsvFile(produtosIguais, caminhoArquivo)
    return produtosIguais
}


// Transformar o objeto retornado em array 
function writeCsvFile(dados, path) {
    // Criando as colunas 
    const csvWriter = createObjectCsvWriter({
        path: path,
        header: [
            {id: 'Produto1_nome', title: 'Produto1: nome'},
            {id: 'Produto1_link', title: 'Produto1: link'},
            {id: 'Produto1_skuProduto', title: 'Produto1: sku produto'},
            {id: 'Produto2_nome', title: 'Produto2: nome'},
            {id: 'Produto2_link', title: 'Produto2: link'},
            {id: 'Produto2_skuProduto',title: 'Produto2: sku produto'}
        ]
    })

    // Transformando os dados do objeto no formato para csv
    const dadosParaCSV = dados.map(item => ({
        Produto1_nome: item.Produto1.nome,
        Produto1_link: item.Produto1.link,
        Produto1_skuProduto: item.Produto1.skuProduto,
        Produto2_nome: item.Produto2.nome,
        Produto2_link: item.Produto2.link,
        Produto2_skuProduto: item.Produto2.skuProduto,
    }));
    

    csvWriter.writeRecords(dadosParaCSV).then(() => {
        console.log(`Dados foram gravados em ${caminhoArquivo}`);
    }).catch((err) => {
        console.error('Erro ao gravar no arquivo CSV:', err);
    });
}