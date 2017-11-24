//Dijkstra's algorithm solver
//By Mostafa Dahshan <mdahshan@outlook.com>

var svg = document.getElementById('shortestPathSvg'),
    gedge = document.getElementById('gedge'),
    gvertex = document.getElementById('gvertex'),
    saveButton = document.getElementById('savesvgbutton'),
    svgns = "http://www.w3.org/2000/svg",
    isDrawingEdge = false,
    edgeVertex1 = null,
    edgeVertex2 = null,
    vertices = document.getElementsByTagName("circle"),
    edges = document.getElementsByTagName("line"),
    texts = document.getElementsByTagName("text"),
    nextLabelCode= 65; //65='A' ,  97='a'


var markedVertices = [],
    table = document.getElementById("dijkstraSteps");



const   vertexRadius = 20,
        vertexLabelSize = "16pt",
        vertexColor = "white",
        vertexBorderColor = "black",
        startVertexColor = "magenta",
        markedVertexColor = "blue",
        markedEdgeColor = "cyan",
        vertexLabelColor = "black",
        edgeColor = "darkgrey",
        edgeWidth = 6,
        edgeLabelColor= "black",
        edgeLabelSize = "20pt",
        INF=100000;


svg.onmousedown = mouseClick;
saveButton.onmousedown = saveSvgFile;
//gedge.onmousedown = mouseClick;
//gvertex.onmousedown = mouseClick;

function mouseClick (e) {

    var radWorkMode=document.getElementsByName("radWorkMode"),
        workMode = null,
        clickTarget = null;
    
    for(var i=0; i< radWorkMode.length; i++)
        if(radWorkMode[i].checked){
            workMode = radWorkMode[i].value;
            break;
        }
    
    if(e.target.nodeName == "text")
        clickTarget=e.target.under;
    else
        clickTarget = e.target;
    

    switch (workMode) {
        case "drawVertex":
            if(clickTarget==svg){
                    drawVertex(e.clientX, e.clientY);
                }
                break;

        case "drawEdge":
            if(clickTarget.nodeName=="circle") {
                if(!isDrawingEdge){
                    edgeVertex1 = clickTarget;
                    isDrawingEdge=true;
                }
                else if(clickTarget != edgeVertex1){ //edge cannot be from a vertex to itself
                    edgeVertex2 = clickTarget;
                    drawEdge(edgeVertex1, edgeVertex2);
                    edgeVertex1 = null;
                    edgeVertex2 = null;
                    isDrawingEdge = false;
                }
            }
            break;

        case "delVertexEdge":
            if(clickTarget.nodeName == "circle") 
                delVertex(clickTarget);

            if(clickTarget.nodeName=="line")
                 delEdge(clickTarget);
            break;     

        case "setCostLabel":
            if(clickTarget.nodeName == "circle") {
				var vertex = clickTarget;
                showDialogVertexLabel(vertex);
            }

            if(clickTarget.nodeName == "line") {
				var edge = clickTarget;
                showDialogEdgeCost(edge);
            }
            break;     

        case "setStart":
            if(clickTarget.nodeName == "circle") {
                setVertexNeighbors();
                var vertex = clickTarget;
                vertex.isSource = true;
                dijkstra(vertex);
            }
            break;     

    }

}



function drawVertex(px, py){

    var vertex = document.createElementNS(svgns, "circle");
    vertex.setAttributeNS(null, "cx", px);
    vertex.setAttributeNS(null, "cy", py);
    vertex.setAttributeNS(null, "r",  vertexRadius);
    vertex.setAttributeNS(null, "fill", vertexColor);
    vertex.setAttributeNS(null, "stroke", vertexBorderColor);
    vertex.style["cursor"] = "pointer";
     
    
    gvertex.appendChild(vertex);

    
    vertex.label =  String.fromCharCode(nextLabelCode++);
    vertex.labelText = document.createElementNS(svgns, "text");
    vertex.labelText.setAttribute("x", vertex.cx.baseVal.value);
    vertex.labelText.setAttribute("y", vertex.cy.baseVal.value);
    vertex.labelText.setAttribute("text-anchor", "middle");
    vertex.labelText.setAttribute("alignment-baseline", "central");
    vertex.labelText.setAttribute("font-size", vertexLabelSize);
    vertex.labelText.setAttribute("fill", vertexLabelColor);
    vertex.labelText.textContent=vertex.label;
    vertex.labelText.under=vertex;
    vertex.labelText.boundTo="vertex";
    vertex.labelText.style["cursor"] = "pointer";
    gvertex.appendChild(vertex.labelText);


    vertex.edges=[];
    vertex.neighbors=[];
    vertex.isSource=false;
    vertex.cost=0;
    vertex.previous = -1;
}

function drawEdge(vertex1, vertex2) {
    var x1 = vertex1.getAttributeNS(null, "cx"),
        y1 = vertex1.getAttributeNS(null, "cy"),
        x2 = vertex2.getAttributeNS(null, "cx"),
        y2 = vertex2.getAttributeNS(null, "cy"),
        edgeExists = false;

    //check if a previous edge exists between the same vertices
    for(var i=0; i<edges.length; i++){
        if( edges[i].x1.baseVal.value == parseInt(x1) && edges[i].x2.baseVal.value == parseInt(x2) &&
            edges[i].y1.baseVal.value == parseInt(y1) && edges[i].y2.baseVal.value == parseInt(y2)) {
                edgeExists = true;
                break;
            }
    }
    if(edgeExists) {
        alert("Edge Exists!")
    }
    else {
   
        var edge = document.createElementNS(svgns, "line");
        edge.setAttributeNS(null, "x1", x1);
        edge.setAttributeNS(null, "x2", x2);
        edge.setAttributeNS(null, "y1", y1);
        edge.setAttributeNS(null, "y2", y2);
        edge.setAttributeNS(null, "stroke", edgeColor);
        edge.setAttributeNS(null, "stroke-width", edgeWidth);
        gedge.appendChild(edge);

        edge.fromVertex=vertex1;
        edge.toVertex=vertex2;

        edge.cost = 1;
        edge.costText = document.createElementNS(svgns, "text");
        edge.costText.setAttribute("x", 0.5*(edge.x1.baseVal.value+edge.x2.baseVal.value));
        edge.costText.setAttribute("y", 0.5*(edge.y1.baseVal.value+edge.y2.baseVal.value));
        edge.costText.setAttribute("text-anchor", "middle");
        edge.costText.setAttribute("alignment-baseline", "central");
        edge.costText.setAttribute("font-size", edgeLabelSize);
        edge.costText.setAttribute("fill", edgeLabelColor);
        edge.costText.textContent=edge.cost;
        edge.costText.under=edge;
        edge.costText.boundTo="edge";
        edge.style["cursor"] = "pointer";
        edge.costText.style["cursor"] = "pointer";

        gedge.appendChild(edge.costText);
        vertex1.edges.push(edge);
        vertex2.edges.push(edge);
    }
    
}

function setEdgeCost(edge, cost) {
    edge.cost = cost;
    edge.costText.textContent=edge.cost;
}


function setVertexLabel (vertex, label) {
    vertex.label =  label;
    vertex.labelText.textContent=vertex.label;
}

function delVertex(vertex){
    while(vertex.edges.length > 0)
        delEdge(vertex.edges[0]);
    
    gvertex.removeChild(vertex.labelText);
    gvertex.removeChild(vertex);
}

function delEdge(edge) {
    //delete edge.fromVertex.edges;
    for(var i=0; i< edge.fromVertex.edges.length; i++)
        if(edge.fromVertex.edges[i] == edge) {
            edge.fromVertex.edges.splice(i,1);
            break;
        }

    //delete edge.toVertex.edges
    for(var i=0; i< edge.toVertex.edges.length; i++)
        if(edge.toVertex.edges[i] == edge) {
            edge.toVertex.edges.splice(i,1);
            break;
        }
    gedge.removeChild(edge.costText);
    gedge.removeChild(edge);
}



function setVertexNeighbors(){
    for(var i =0; i< vertices.length; i++)
        for(var j=0; j< vertices[i].edges.length; j++) {
            if(vertices[i].edges[j].fromVertex == vertices[i])
                vertices[i].neighbors.push(vertices[i].edges[j].toVertex);
            else
                vertices[i].neighbors.push(vertices[i].edges[j].fromVertex);
        }

}


function redraw() {
    for(var i=0; k<edges.length; i++)
        svg.appendChild(edges[i]);

    for(var j=0; k<vertices.length; j++)
        svg.appendChild(vertices[j]);

    for(var k=0; k<texts.length; k++)
        svg.appendChild(texts[k]);

}


function clearGraph() {
    while (svg.lastChild)
        svg.removeChild(svg.lastChild);
}

function dijkstra(source) {
    //initialization
    var tr=0, round=1;
    table.innerHTML="";
    table.setAttribute("border",1);
    var row = table.insertRow(0);
    var cell = row.insertCell(0);
    cell.innerHTML = "Round";

    setVertexNeighbors();

    for(i=0; i< vertices.length; i++){
        vertices[i].cost = INF;
        vertices[i].previous = null; 
        vertices[i].marked = false;
        vertices[i].markedRound = INF;
        
        //interface begin
        cell = row.insertCell(i+1);
        cell.innerHTML=vertices[i].label;
        if(vertices[i]==source)
            vertices[i].setAttribute("fill", startVertexColor);
        else
            vertices[i].setAttribute("fill", vertexColor);

        //interface end
    }

    markedVertices =[];
    source.cost = 0;

    //interface begin
    tr++;
    row=table.insertRow(tr);
    cell=row.insertCell(0);
    cell.innerHTML = round;
    for(i=0; i< vertices.length; i++){
        cell=row.insertCell(i+1);
        cell.innerHTML=(vertices[i].cost==INF)?'∞':vertices[i].cost;
        cell.innerHTML+=', '+ ((vertices[i].previous==null)?'-':vertices[i].previous.label);
    }
    //interface end

    do {
        //find vertex with minimum cost
        var min = INF;

        for(i=0; i< vertices.length; i++)
            if(vertices[i].cost < min && !vertices[i].marked) {
                m = i; min = vertices[m].cost;
            }

        vertices[m].marked = true; vertices[m].markedRound=round;
        markedVertices.push(vertices[m]);
        //relax edges
        for(j=0; j< vertices[m].edges.length; j++){
            neighbor= (vertices[m].edges[j].fromVertex == vertices[m])? vertices[m].edges[j].toVertex : neighbor=vertices[m].edges[j].fromVertex;
            edge=vertices[m].edges[j];

            if(neighbor.cost > vertices[m].cost + edge.cost){
                neighbor.cost = vertices[m].cost + edge.cost;
                neighbor.previous = vertices[m];
            }
        }

        //interface begin
        tr++;round++;
        if(markedVertices.length < vertices.length) {
            row=table.insertRow(tr);
            cell=row.insertCell(0);
            cell.innerHTML = round;

            for(i=0; i< vertices.length; i++){
                cell=row.insertCell(i+1);
                if(vertices[i].markedRound > round){
                    cell.innerHTML=(vertices[i].cost==INF)?'∞':vertices[i].cost;
                    cell.innerHTML+=', '+ ((vertices[i].previous==null)?'-':vertices[i].previous.label);
                }
            }
        }
        
        //interface end

    } while(markedVertices.length < vertices.length);

    //color tree
}

//File save from
function saveSvgFile() {
    var s = new XMLSerializer();
    content=s.serializeToString(svg);
    downloadFile("dijkstra.svg",content);
}

//Credit
//http://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file
function downloadFile(filename, content) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}


//Modal

// Credit: https://www.w3schools.com/howto/howto_css_modals.asp 

var dialogEdgeCost = document.getElementById('divEdgeCost');
var dialogVertexLabel = document.getElementById('divVertexLabel');


function showDialogEdgeCost (edge) {
    var inputEdgeCost = document.getElementById("inputEdgeCost");
    var btnSetEdgeCost = document.getElementById("btnSetEdgeCost");

    inputEdgeCost.value = edge.cost;
    dialogEdgeCost.style.display = "block";
    
    btnSetEdgeCost.onclick = function () {
        dialogEdgeCost.style.display = "none";
        var cost=parseInt(inputEdgeCost.value);
        if(cost)
            setEdgeCost(edge, cost);
    }
}

function closeDialogEdgeCost() {
    dialogEdgeCost.style.display = "none";
}

function showDialogVertexLabel (vertex) {
    var inputVertexLabel = document.getElementById("inputVertexLabel");
    var btnSetVertexLabel = document.getElementById("btnSetVertexLabel");

    inputVertexLabel.value = vertex.label;
    dialogVertexLabel.style.display = "block";
    
    btnSetVertexLabel.onclick = function () {
        dialogVertexLabel.style.display = "none";
        var label = inputVertexLabel.value;
        if(label)
            setVertexLabel(vertex, label);
    }
}

function closeDialogVertexLabel() {
    dialogVertexLabel.style.display = "none";
}
