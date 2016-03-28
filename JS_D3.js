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
      var scale = d3.scale.linear().range([1,20])
        .domain([d3.min(validVals,massVal),
                 d3.max(validVals,massVal)]);
      function getRadius(d){
        return scale(d.properties.mass);
      };
      
      svg.selectAll(".hits")
        .data(validVals).enter()
        .append("circle")
        .attr("r",getRadius)
        .style("fill","rgba(0,0,0,0.5)")
        .attr("transform",function(d){return "translate("+projection(d.geometry.coordinates)+")"});
    });
  });
});
