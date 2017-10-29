//Dijkstra's algorithm solver
//By Mostafa Dahshan <mdahshan@outlook.com>

var svg = document.getElementById('shortestPathSvg'),
    glink = document.getElementById('glink'),
    gnode = document.getElementById('gnode'),
    saveButton = document.getElementById('savesvgbutton'),
    svgns = "http://www.w3.org/2000/svg",
    isDrawingLink = false,
    linkNode1 = null,
    linkNode2 = null,
    nodes = document.getElementsByTagName("circle"),
    links = document.getElementsByTagName("line"),
    texts = document.getElementsByTagName("text"),
    nextLabelCode= 65; //65='A' ,  97='a'


var markedNodes = [],
    table = document.getElementById("dijkstraSteps");



const   nodeRadius = 20,
        nodeLabelSize = "16pt",
        nodeColor = "white",
        nodeBorderColor = "black",
        startNodeColor = "magenta",
        markedNodeColor = "blue",
        markedLinkColor = "cyan",
        nodeLabelColor = "black",
        linkColor = "darkgrey",
        linkWidth = 2,
        linkLabelColor= "black",
        linkLabelSize = "20pt",
        INF=100000;


svg.onmousedown = mouseClick;
saveButton.onmousedown = saveSvgFile;
//glink.onmousedown = mouseClick;
//gnode.onmousedown = mouseClick;

function mouseClick (e) {

    var radWorkMode=document.getElementsByName("radWorkMode"),
        workMode = null;
    
    for(var i=0; i< radWorkMode.length; i++)
        if(radWorkMode[i].checked){
            workMode = radWorkMode[i].value;
            break;
        }

    switch (workMode) {
        case "drawNode":
            if(e.target==svg){
                    drawNode(e.clientX, e.clientY);
                }
                break;

        case "drawLink":
            if(e.target.nodeName=="circle") {
                if(!isDrawingLink){
                    linkNode1 = e.target;
                    isDrawingLink=true;
                }
                else if(e.target != linkNode1){ //link cannot be from a node to itself
                    linkNode2 = e.target;
                    drawLink(linkNode1, linkNode2);
                    linkNode1 = null;
                    linkNode2 = null;
                    isDrawingLink = false;
                }
            }
            break;

        case "delNodeLink":
            if(e.target.nodeName == "circle") 
                delNode(e.target);

            if(e.target.nodeName=="line")
                 delLink(e.target);
            break;     

        case "setCostLabel":
            if(e.target.nodeName == "circle") {
				var node = e.target;
                var label=window.prompt("Enter node label",node.label);
                if(!label)
                    label = node.label;
                setNodeLabel(node, label);
            }

            if(e.target.nodeName == "line") {
				var link = e.target;
                var cost=parseInt(window.prompt("Enter link cost", link.cost));
                if(!cost)
                    cost = link.cost;
                setLinkCost(link, cost);
            }
            break;     

        case "setStart":
            if(e.target.nodeName == "circle") {
                setNodeNeighbors();
                var node = e.target;
                node.isSource = true;
                dijkstra(node);
            }
            break;     

    }

}



function drawNode(px, py){

    var node = document.createElementNS(svgns, "circle");
    node.setAttributeNS(null, "cx", px);
    node.setAttributeNS(null, "cy", py);
    node.setAttributeNS(null, "r",  nodeRadius);
    node.setAttributeNS(null, "fill", nodeColor);
    node.setAttributeNS(null, "stroke", nodeBorderColor);
    gnode.appendChild(node);

  
    node.label =  String.fromCharCode(nextLabelCode++);
    node.labelText = document.createElementNS(svgns, "text");
    node.labelText.setAttribute("x", node.cx.baseVal.value);
    node.labelText.setAttribute("y", node.cy.baseVal.value);
    node.labelText.setAttribute("text-anchor", "middle");
    node.labelText.setAttribute("alignment-baseline", "central");
    node.labelText.setAttribute("font-size", nodeLabelSize);
    node.labelText.setAttribute("fill", nodeLabelColor);
    node.labelText.textContent=node.label;
    node.labelText.node=node;
    node.labelText.boundTo="node";
    gnode.appendChild(node.labelText);


    node.links=[];
    node.neighbors=[];
    node.isSource=false;
    node.cost=0;
    node.previous = -1;
}

function drawLink(node1, node2) {
    var x1 = node1.getAttributeNS(null, "cx"),
        y1 = node1.getAttributeNS(null, "cy"),
        x2 = node2.getAttributeNS(null, "cx"),
        y2 = node2.getAttributeNS(null, "cy"),
        linkExists = false;

    //check if a previous link exists between the same nodes
    for(var i=0; i<links.length; i++){
        if( links[i].x1.baseVal.value == parseInt(x1) && links[i].x2.baseVal.value == parseInt(x2) &&
            links[i].y1.baseVal.value == parseInt(y1) && links[i].y2.baseVal.value == parseInt(y2)) {
                linkExists = true;
                break;
            }
    }
    if(linkExists) {
        alert("Link Exists!")
    }
    else {
   
        var link = document.createElementNS(svgns, "line");
        link.setAttributeNS(null, "x1", x1);
        link.setAttributeNS(null, "x2", x2);
        link.setAttributeNS(null, "y1", y1);
        link.setAttributeNS(null, "y2", y2);
        link.setAttributeNS(null, "stroke", linkColor);
        link.setAttributeNS(null, "stroke-width", linkWidth);
        glink.appendChild(link);

        link.fromNode=node1;
        link.toNode=node2;

        link.cost = 1;
        link.costText = document.createElementNS(svgns, "text");
        link.costText.setAttribute("x", 0.5*(link.x1.baseVal.value+link.x2.baseVal.value));
        link.costText.setAttribute("y", 0.5*(link.y1.baseVal.value+link.y2.baseVal.value));
        link.costText.setAttribute("text-anchor", "middle");
        link.costText.setAttribute("alignment-baseline", "central");
        link.costText.setAttribute("font-size", linkLabelSize);
        link.costText.setAttribute("fill", linkLabelColor);
        link.costText.textContent=link.cost;
        link.costText.link=link;
        link.costText.boundTo="link";
        glink.appendChild(link.costText);

        node1.links.push(link);
        node2.links.push(link);
    }
    
}

function setLinkCost(link, cost) {
    link.cost = cost;
    link.costText.textContent=link.cost;
}


function setNodeLabel (node, label) {
    node.label =  label;
    node.labelText.textContent=node.label;
}

function delNode(node){
    while(node.links.length > 0)
        delLink(node.links[0]);
    
    gnode.removeChild(node.labelText);
    gnode.removeChild(node);
}

function delLink(link) {
    //delete link.fromNode.links;
    for(var i=0; i< link.fromNode.links.length; i++)
        if(link.fromNode.links[i] == link) {
            link.fromNode.links.splice(i,1);
            break;
        }

    //delete link.toNode.links
    for(var i=0; i< link.toNode.links.length; i++)
        if(link.toNode.links[i] == link) {
            link.toNode.links.splice(i,1);
            break;
        }
    glink.removeChild(link.costText);
    glink.removeChild(link);
}



function setNodeNeighbors(){
    for(var i =0; i< nodes.length; i++)
        for(var j=0; j< nodes[i].links.length; j++) {
            if(nodes[i].links[j].fromNode == nodes[i])
                nodes[i].neighbors.push(nodes[i].links[j].toNode);
            else
                nodes[i].neighbors.push(nodes[i].links[j].fromNode);
        }

}


function redraw() {
    for(var i=0; k<links.length; i++)
        svg.appendChild(links[i]);

    for(var j=0; k<nodes.length; j++)
        svg.appendChild(nodes[j]);

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

    setNodeNeighbors();

    for(i=0; i< nodes.length; i++){
        nodes[i].cost = INF;
        nodes[i].previous = null; 
        nodes[i].marked = false;
        nodes[i].markedRound = INF;
        
        //interface begin
        cell = row.insertCell(i+1);
        cell.innerHTML=nodes[i].label;
        if(nodes[i]==source)
            nodes[i].setAttribute("fill", startNodeColor);
        else
            nodes[i].setAttribute("fill", nodeColor);

        //interface end
    }

    markedNodes =[];
    source.cost = 0;

    //interface begin
    tr++;
    row=table.insertRow(tr);
    cell=row.insertCell(0);
    cell.innerHTML = round;
    for(i=0; i< nodes.length; i++){
        cell=row.insertCell(i+1);
        cell.innerHTML=(nodes[i].cost==INF)?'∞':nodes[i].cost;
        cell.innerHTML+=', '+ ((nodes[i].previous==null)?'-':nodes[i].previous.label);
    }
    //interface end

    do {
        //find node with minimum cost
        var min = INF;

        for(i=0; i< nodes.length; i++)
            if(nodes[i].cost < min && !nodes[i].marked) {
                m = i; min = nodes[m].cost;
            }

        nodes[m].marked = true; nodes[m].markedRound=round;
        markedNodes.push(nodes[m]);
        //relax edges
        for(j=0; j< nodes[m].links.length; j++){
            neighbor= (nodes[m].links[j].fromNode == nodes[m])? nodes[m].links[j].toNode : neighbor=nodes[m].links[j].fromNode;
            link=nodes[m].links[j];

            if(neighbor.cost > nodes[m].cost + link.cost){
                neighbor.cost = nodes[m].cost + link.cost;
                neighbor.previous = nodes[m];
            }
        }

        //interface begin
        tr++;round++;
        if(markedNodes.length < nodes.length) {
            row=table.insertRow(tr);
            cell=row.insertCell(0);
            cell.innerHTML = round;

            for(i=0; i< nodes.length; i++){
                cell=row.insertCell(i+1);
                if(nodes[i].markedRound > round){
                    cell.innerHTML=(nodes[i].cost==INF)?'∞':nodes[i].cost;
                    cell.innerHTML+=', '+ ((nodes[i].previous==null)?'-':nodes[i].previous.label);
                }
            }
        }
        
        //interface end

    } while(markedNodes.length < nodes.length);

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