
const image_size = 500;
const node_radius = 10;
const hilite_radius = 14;
const mouse_dist = 7;

const node_color = [ 0, 0, 255 ];
const text_color = [ 255, 255, 255 ];
const hilite_color = [ 255, 0, 0 ];

const debugging_on = true;

var nodes = [];
var edges = [];
var selected_node = -1;
 
////////////////////////////////////////////////////////////////
 
function setup() {
    let my_canvas = createCanvas(image_size, image_size);
    my_canvas.parent('graph_div');
}
 
////////////////////////////////////////////////////////////////
 
function draw() {
  background(255);
 
  // Draw edges
  for (let i = 0; i < edges.length; i++) {
    let source = edges[i].source;
    let target = edges[i].target;
    strokeWeight(2);
    stroke(0);
    line(source.x, source.y, target.x, target.y);
  }
 
   // console.log("draw(): nodes.length=" + nodes.length);
 
  // Draw nodes
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    fill( (node.label == selected_node.label ? random_color() : node_color) );
    noStroke();
    ellipse(node.x, node.y, node_radius, node_radius);
 
    // Draw labels
    fill(text_color);
    textAlign(CENTER, CENTER);
    text(node.label, node.x, node.y);
 
    // Highlight selected node
    if (node == selected_node) {
      strokeWeight(4);
      stroke(hilite_color);
      noFill();
      ellipse(node.x, node.y, hilite_radius, hilite_radius);
    }
  }
}
 
////////////////////////////////////////////////////////////////
 
function mousePressed() {
    // Check if a node was clicked
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (dist(mouseX, mouseY, node.x, node.y) < mouse_dist) {
            if (selected_node == -1) {
                my_debug("OP: Selecting node:" + node.label );
                selected_node = node;
            } else if (selected_node.label === node.label ) {
                my_debug("OP: Deleting node:" + node.label );
                delete_node(node);
                selected_node = -1;
            } else {
                // Create edge between selected node and clicked node
                if ( ! delete_edge(selected_node, node) ) {
                    add_edge(node, selected_node);
                } else {
                    my_debug("OP: After deleting edge:" + selected_node.label + "=" + node.label );
                }
                selected_node = -1;
            }
            return;
        }
    }
 
    // Create new node
    add_node(mouseX, mouseY);
    get_graph_text()
}
 
////////////////////////////////////////////////////////////////
 
function add_edge(node1, node2) {
    let tmp = node1;
    if ( node1.label > node2.label ) {
        node1 = node2;
        node2 = tmp;
    }
    edges.push({source: node1, target: node2});
    my_debug("OP: Adding edge:" + node1.label + "=" + node2.label );
    get_graph_text();
}
 
////////////////////////////////////////////////////////////////
 
function edge_index(src, tgt) {
    if ( src.label > tgt.label ) {
        let tmp = src;
        src = tgt;
        tgt = tmp;
    }
    for (let i = 0; i < edges.length; i++) {
        if ( ( src.label === edges[i].source.label ) && ( tgt.label === edges[i].target.label ) ) {
            return i;
        }
    }
    return -1;
}
 
////////////////////////////////////////////////////////////////
function add_node(x_coordinate,y_coordinate) {
 
    let node_label = -1;
    for (let i = 0; i < nodes.length; i++) {
        if ( nodes[i].label > i ) {
            node_label = i; // nodes[i].label;
            break;
        }
    }
 
    if ( node_label == -1 ) {
        node_label = nodes.length;
    }
 
    my_debug("OP: Adding node:" + node_label);
    let adjusted = adjust_coordinates(x_coordinate, y_coordinate);
    my_debug("======================Add node:" + node_label );
    my_debug("adjusted=" + JSON.stringify(adjusted,null,2));
    nodes.push({x: adjusted.x, y: adjusted.y, label: node_label });
    sort_nodes();
    my_debug("nodes.length=" + nodes.length);
    my_debug("nodes=" + JSON.stringify(nodes, null, 2));
}
 
////////////////////////////////////////////////////////////////
 
function delete_node(node) {
    let new_nodes = [];
    for (let i = 0; i < nodes.length; i++) {
        let current_node = nodes[i];
        if ( node.label !== current_node.label ) {
            new_nodes.push(current_node);
        }
    }
    nodes = new_nodes;
    sort_nodes();
 
    let new_edges = [];
    for (let i = 0; i < edges.length; i++) {
        if ( ( node.label !== edges[i].source.label ) && ( node.label !== edges[i].target.label ) ) {
            new_edges.push(edges[i]);
        }
    }
    edges = new_edges;
    get_graph_text();
}
 
////////////////////////////////////////////////////////////////
 
function delete_edge(src,tgt) {
    let i = edge_index(src, tgt);
    if ( i == -1 ) {
        my_debug("No edge:[" + src.label + "=" + tgt.label + "]");
        return false;
    } else {
        my_debug("Deleting edge at index:" + i + "[" + edges[i].source.label + "=" + edges[i].target.label + "]");
        edges.splice(i,1);
        get_graph_text();
        return true;
    }
}
 
////////////////////////////////////////////////////////////////
 
function my_debug(x) {
    if ( debugging_on ) {
	console.log(x);
    }
    // let gt = document.getElementById("graph_text");
    // gt.value += "\n" + x;
}
 
////////////////////////////////////////////////////////////////
 
function random_color() {
  return [ random(255), random(255), random(255) ];
}
 
////////////////////////////////////////////////////////////////
 
function sort_nodes() {
    nodes.sort((a,b)=>{
        if ( a.label < b.label ) return -1;
        if ( a.label > b.label ) return 1;
        return 0;
    });
}
 
////////////////////////////////////////////////////////////////
 
function adjust_coordinates(x, y) {
    if ( nodes.length == 0 ) {
        return { x: x, y: y };
    }
    for ( let target_distance = 2; target_distance < 30; target_distance += 2 ) {
        for (let reps=0; reps < 1000; reps++) {
            let adjusted_x = x + random_offset(target_distance);
            let adjusted_y = y + random_offset(target_distance);
            my_debug("adjust_x=[" + adjusted_x + "] adjusted_y=[" + adjusted_y + "]");
            let good_candidate = true;
            for (let i = 0; i < nodes.length; i++) {
                if (dist(nodes[i].x, nodes[i].y, adjusted_x, adjusted_y) < mouse_dist * 2 ) {
                    good_candidate = false;
                    break;
                }
            }
            if ( good_candidate ) {
                return { x: adjusted_x, y: adjusted_y };
            }
        }
    }
 
    let message = "Could not place new node clicked at: x=[" + x + "] y=[" + y + "]";
    my_debug(message);
    alert(message);
    return { x: x, y: y };
}
 
////////////////////////////////////////////////////////////////
function random_offset(distance) {
    let offset = random(distance);
    if ( Math.floor( Math.random() ) == 0 ) {
        offset *= -1.0;
    }
    return offset;
}

////////////////////////////////////////////////////////////////
 
function get_graph_text() {
    let edge_pairs = [];
    for (let i = 0; i < edges.length; i++) {
        let source = edges[i].source;
        let target = edges[i].target;
        let edge_string = source.label + "=" + target.label;
        edge_pairs.push(edge_string);
    }
 
    let graph_text = edge_pairs.join(",");
    let gt = document.getElementById("graph_text");
    gt.value = graph_text;
}
 
 
////////////////////////////////////////////////////////////////
