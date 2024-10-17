// Функция за генериране на матрицата за въвеждане
function generateMatrix() {
    const size = document.getElementById("size").value;
    const matrixInput = document.getElementById("matrixInput");
    matrixInput.innerHTML = ""; // Изчистваме предишното съдържание

    if (size === "" || size <= 0) {
        alert("Моля, въведете валиден брой върхове.");
        return;
    }

    let table = document.createElement("table");

    // Създаваме таблица за въвеждане на матрицата
    for (let i = 0; i < size; i++) {
        let row = document.createElement("tr");
        for (let j = 0; j < size; j++) {
            let cell = document.createElement("td");
            let input = document.createElement("input");
            input.type = "number";
            input.id = `cell-${i}-${j}`;
            input.value = i === j ? 0 : ""; // Попълваме диагонала с нули
            cell.appendChild(input);
            row.appendChild(cell);
        }
        table.appendChild(row);
    }

    matrixInput.appendChild(table);

    // След като генерираме матрицата, показваме бутона за генериране на таблицата
    document.getElementById("generateTableBtn").style.display = "block";
}

// Функция за генериране на началната таблица с върховете
function generateInitialTable() {
    const size = document.getElementById("size").value;

    if (size === "" || size <= 0) {
        alert("Моля, въведете валиден брой върхове.");
        return;
    }

    let resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `<h3>Начално състояние на таблицата:</h3>`;
    
    let table = `<table border="1"><tr><th>Връх</th><th>V</th><th>D</th><th>P</th></tr>`;
    
    for (let i = 0; i < size; i++) {
        table += `<tr>
                    <td>${i}</td>
                    <td>0</td> <!-- Всички върхове са непосетени (V = 0) -->
                    <td>∞</td> <!-- Разстоянието до всички върхове е безкрайност -->
                    <td>-1</td> <!-- Няма предшественици, затова P = -1 -->
                  </tr>`;
    }
    
    table += `</table>`;
    resultDiv.innerHTML += table;
}

// Извличане на матрицата от потребителския интерфейс
function extractMatrix(size) {
    let matrix = [];
    for (let i = 0; i < size; i++) {
        matrix[i] = [];
        for (let j = 0; j < size; j++) {
            let value = parseInt(document.getElementById(`cell-${i}-${j}`).value);
            if (isNaN(value)) value = Infinity; // В случай че клетката е празна
            matrix[i][j] = value;
        }
    }
    return matrix;
}

// Функция за създаване на таблицата с резултати
function updateResultTable(distances, visited, predecessors) {
    const resultTable = document.getElementById("matrixResult");
    resultTable.innerHTML = ""; // Изчистваме предишното съдържание

    let table = "<table border='1'><tr><th>връх</th><th>V</th><th>D</th><th>P</th></tr>";

    for (let i = 0; i < distances.length; i++) {
        table += `<tr>
                    <td>${i}</td>
                    <td>${visited[i] ? 1 : 0}</td> <!-- Маркира се текущият връх като 1 -->
                    <td>${distances[i] === Infinity ? '∞' : distances[i]}</td> <!-- Ако няма път, показваме ∞ -->
                    <td>${predecessors[i] !== null ? predecessors[i] : '-'}</td> <!-- Ако няма предшествник, показваме - -->
                  </tr>`;
    }

    table += "</table>";
    resultTable.innerHTML = table; // Добавяме таблицата в HTML

}

// Алгоритъм на Дейкстра
function dijkstra() {
    const size = parseInt(document.getElementById("size").value);
    const startVertex = parseInt(document.getElementById("startVertex").value);

    // Проверка за валиден начален връх
    if (isNaN(startVertex) || startVertex < 0 || startVertex >= size) {
        alert("Моля, въведете валиден начален връх.");
        return;
    }

    const graph = extractMatrix(size); // Извличане на матрицата

    let distances = new Array(size).fill(Infinity); // Начално разстояние: ∞
    let visited = new Array(size).fill(false);      // Всички върхове са непосетени в началото
    let predecessors = new Array(size).fill(null);  // Предшествениците са празни в началото

    distances[startVertex] = 0;  // Разстоянието до началния връх е 0

    // Основният цикъл на Дейкстра
    const updateAlgorithm = () => {
    // Намираме следващия връх с минимално разстояние
    let u = minDistance(distances, visited);
    
    if (u === -1 || distances[u] === Infinity) {
        return; // Спираме, ако няма повече достъпни върхове
    }

    visited[u] = true; // Маркираме текущия връх като посетен

    // Актуализиране на разстоянията до съседните върхове
    for (let v = 0; v < size; v++) {
        if (!visited[v] && graph[u][v] !== 0 && graph[u][v] !== Infinity &&
            distances[u] !== Infinity && distances[u] + graph[u][v] < distances[v]) {

            distances[v] = distances[u] + graph[u][v];
            predecessors[v] = u;  // Актуализиране на предшественика
        }
    }

    // Актуализиране на таблицата след обработка на върха
    updateResultTable(distances, visited, predecessors);

    // Изпълняваме следващата итерация след 6 секунди
    setTimeout(updateAlgorithm, 6000);
};


    updateAlgorithm(); // Започваме алгоритъма

    // Показваме прозореца за визуализация на графа
    const graphContainer = document.getElementById("mynetwork");
    graphContainer.style.display = "block"; // Показваме графа

    // Визуализираме графа
    visualizeGraph(graph);
}


// Намиране на върха с минимално разстояние
function minDistance(distances, visited) {
    let min = Infinity, minIndex = -1;
    distances.forEach((dist, v) => {
        if (!visited[v] && dist <= min) {
            min = dist;
            minIndex = v;
        }
    });

    console.log(`Next vertex to visit: ${minIndex}, distance: ${min}`);
    return minIndex;
}

// Визуализация на графа
function visualizeGraph(graph) {
    const nodes = new vis.DataSet();
    const edges = new vis.DataSet();
    const size = graph.length;

    // Добавяне на върховете в графа
    for (let i = 0; i < size; i++) {
        nodes.add({ id: i, label: `Връх ${i}` });
    }

    // Добавяне на ръбовете в графа
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            // Добавяме ръб само ако стойността в матрицата не е безкрайност и не е нула
            if (graph[i][j] !== Infinity && graph[i][j] > 0) {
                edges.add({ from: i, to: j, label: `${graph[i][j]}`, arrows: "to" });
            }
        }
    }

    const container = document.getElementById('mynetwork');
    const data = { nodes, edges };

    // Опции за графа
    const options = {
        edges: {
            arrows: {
                to: { enabled: true } // Добавя стрелка към ръбовете
            },
            smooth: {
                type: 'curvedCW', // Използваме извити ръбове
                roundness: 0.2 // Колкото по-голяма стойност, толкова по-извити са ръбовете
            }
        },
        physics: {
            enabled: true, // Оставяме физиката активна за по-добра визуализация
            solver: 'repulsion', // Добавя отласкване за раздалечаване на върховете
            repulsion: {
                centralGravity: 0.1,
                springLength: 200,
                springConstant: 0.05,
                nodeDistance: 150, // Разстоянието между върховете
                damping: 0.09
            }
        },
        interaction: {
            dragNodes: false, // Без ръчно преместване на върховете
            dragView: false,
            zoomView: false,
        }
    };

    new vis.Network(container, data, options);
}
