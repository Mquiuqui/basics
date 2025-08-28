function Pessoa(altura, peso) {
    if (!altura || !peso) {
        throw new Error("Altura e peso são obrigatórios");
    }

    this.altura = altura;
    this.peso = peso;
}

function Nutricionista(altura, peso) {
    Pessoa.call(this, altura, peso);
    this.imc = function () {
        return this.peso / (this.altura * this.altura);
    };

    this.classificaIMC = function () {
        var imc = this.imc();
        if (imc < 18.5) {
            return "Abaixo do peso";
        }
        if (imc >= 18.5 && imc < 24.9) {
            return "Peso normal";
        }
        if (imc >= 25 && imc < 29.9) {
            return "Sobrepeso";
        }

        return "Obesidade";
    };
}
Nutricionista.prototype = Object.create(Pessoa.prototype);
Nutricionista.prototype.constructor = Nutricionista;

function renderizaResultadoIMC(nutricionista) {
    document.getElementById("imc").innerText =
        nutricionista.imc().toFixed(2) + " - " + nutricionista.classificaIMC();
}

function actionCalcularIMCBuilder() {
    var alturaEl = document.getElementById("altura");
    var pesoEl = document.getElementById("peso");

    return function actionCalcularIMC(evt) {
        evt.preventDefault();

        var nutricionista = new Nutricionista(
            parseFloat(alturaEl.value),
            parseFloat(pesoEl.value)
        );
    calculaImcComDestaque(nutricionista);
    }
}

var dadosTabelaIMC = [
    { faixa: 'Menor que 18.5', classificacao: 'Abaixo do peso', padraoAPI: "magreza" },
    { faixa: 'Entre 18.5 e 24.9', classificacao: 'Peso normal', padraoAPI: "normal" },
    { faixa: 'Entre 25.0 e 29.9', classificacao: 'Sobrepeso', padraoAPI: "sobrepeso" },
    { faixa: 'Maior que 29.9', classificacao: 'Obesidade', padraoAPI: "obesidade" }
];

function criarTabelaIMC() {
    var tbody = document.querySelector('#imc-tabela tbody');
    tbody.innerHTML = '';

    for (var i = 0; i < dadosTabelaIMC.length; i++) {
        var item = dadosTabelaIMC[i];
        var linha = document.createElement('tr');
        
        linha.setAttribute('data-classificacao', item.classificacao);

        var celulaFaixa = document.createElement('td');
        celulaFaixa.textContent = item.faixa;
        linha.appendChild(celulaFaixa);

        var celulaClassificacao = document.createElement('td');
        celulaClassificacao.textContent = item.classificacao;
        linha.appendChild(celulaClassificacao);

        tbody.appendChild(linha);
    }
}

function calculaImcComDestaque(nutricionista) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:3000/imc/calculate", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            try {
                var response = JSON.parse(xhr.responseText);
                document.getElementById("imc").innerText =
                    response.imc + " - " + response.imcDescription;
                var item = dadosTabelaIMC.find(function(x) { return x.padraoAPI === response.imcDescription; });
                if (item) {
                    destacarLinhaTabela(item.classificacao);
                }
            } catch (e) {
                alert("Erro ao processar resposta da API");
            }
        }
    };
    xhr.send(JSON.stringify({ height: nutricionista.altura, weight: nutricionista.peso }));
}

function destacarLinhaTabela(classificacao) {
    var todasAsLinhas = document.querySelectorAll('#imc-tabela tbody tr');
    
    for (var i = 0; i < todasAsLinhas.length; i++) {
        todasAsLinhas[i].classList.remove('highlight');
    }

    var linhaParaDestacar = document.querySelector('tr[data-classificacao="' + classificacao + '"]');
    if (linhaParaDestacar) {
        linhaParaDestacar.classList.add('highlight');
    }
}

window.onload = function () {
    document
        .getElementById("calcular")
        .addEventListener("click", actionCalcularIMCBuilder());
    criarTabelaIMC();
};
