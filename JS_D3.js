var dataUrl = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json";
var mapUrl = "https://raw.githubusercontent.com/mbostock/topojson/master/examples/world-50m.json";

var w = 950;
var h = 500;

$(document).ready(function(){
  $.get(mapUrl, function(data){
    var world = JSON.parse(data);
    var projection = d3.geo.kavrayskiy7();
var color = d3.scale.category20();
var graticule = d3.geo.graticule();
    var path = d3.geo.path().projection(projection);
    var svg = d3.select("body")
      .append("svg")
      .attr("width",w)
      .attr("height",h);
    
    svg.append("path")
      .datum(graticule)
      .attr("class","graticule")
      .attr("d",path);
    
    svg.append("path")
      .datum(graticule.outline)
      .attr("class","graticule outline")
      .attr("d",path);
    
    var countries = topojson.feature(world,world.objects.countries).features;
    var neighbors = topojson.neighbors(world.objects.countries.geometries);
    
    svg.selectAll(".country")
      .data(countries)
      .enter()
     .insert("path",".graticule")
      .attr("class","country")
      .attr("d",path)
      .style("fill",function(d,i){return color(d.color = d3.max(neighbors[i], function(n){return countries[n].color;}) + 1 | 0);});
    
    $.get(dataUrl,function(results){
      var meteorHits = JSON.parse(results).features;
      var massVal = function(d){return +d.properties.mass;};
      var validVals = meteorHits.filter(function(a){
        if(a.geometry !== null){
          return true;
        }
        return false;
      });
      var scale = d3.scale.linear().range([2,7,20])
        .domain([d3.min(validVals,massVal),
                 d3.mean(validVals,massVal),
                 d3.max(validVals,massVal)]);
      function getRadius(d){
        return scale(d.properties.mass);
      };
      
      var hits = svg.selectAll(".hits")
        .data(validVals).enter()
        .append("circle")
        .attr("r",getRadius)
        .style("fill","rgba(200,0,200,0.5)")
        .attr("transform",function(d){return "translate("+projection(d.geometry.coordinates)+")"});
      
      var Months = ["Jan.","Feb.","Mar.","Apr.","May","Jun.","Jul.","Aug.","Sep.","Oct.","Nov.","Dec."];
      function formatDate(string){
        var date = new Date(string);
        return Months[date.getMonth()-1]+" "+date.getDate()+", "+date.getFullYear();
      }
      
      hits.on("mouseover",function(d){
        tooltip.classed("hide",false)
          .style("left",d3.event.pageX+"px")
          .style("top",d3.event.pageY+"px")
          .text("Name: "+d.properties.name+
               "\nMass: "+d.properties.mass+
               "\nDate: "+formatDate(d.properties.year));
      });
      hits.on("mouseout",function(){
        tooltip.classed("hide",true);
      })
    });
  });
});

var tooltip = d3.select("body").append("div")
  .attr("class","tip hide");
