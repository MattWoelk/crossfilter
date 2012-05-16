// (It's CSV, but GitHub Pages only gzip's JSON at the moment.)
flights = d3.csv.parse("date,delay,distance,origin,destination\n01010001,14,405,MCI,MDW\n01010530,-11,370,LAX,PHX\n01010540,5,389,ONT,SMF\n01010600,-5,337,OAK,LAX\n01010600,3,303,MSY,HOU\n01010605,5,236,LAS,LAX\n01010610,-4,405,MDW,MCI\n01010615,-2,188,RNO,SJC\n01010615,0,197,FLL,TPA\n01010615,0,399,SEA,BOI\n01010615,5,562,ELP,DAL\n01010620,-5,358,SMF,BUR\n01010620,0,491,BNA,MCI\n01010625,-6,361,ONT,OAK\n01010625,0,313,MCI,OKC\n01010625,1,271,MDW,SDF\n01010625,5,689,SLC,SEA\n01010630,-1,487,TPA,MSY\n01010630,-10,399,BOI,SEA\n01010630,-15,621,SJC,PHX\n01010630,-2,361,OAK,ONT\n01010630,-3,220,ISP,BWI\n01010630,-3,397,SMF,LAS\n01010630,-8,251,MDW,STL\n01010630,-8,417,SJC,SAN\n01010630,1,682,BWI,BHM\n01010630,10,370,PHX,LAX\n01010630,15,177,BHM,BNA\n01010630,2,562,DAL,ELP\n01010635,0,453,HOU,TUL\n01010635,1,601,RNO,PHX\n01010635,2,670,BNA,HOU\n01010635,9,677,ABQ,LAX\n01010640,-21,777,BDL,MDW\n01010640,-8,197,ONT,LAS\n01010640,3,833,OKC,PHX\n01010640,5,495,SDF,BWI\n01010645,-14,423,MDW,OMA\n01010645,-14,605,SEA,SMF\n01010645,-19,838,MHT,MDW\n01010645,-5,223,LAS,BUR\n01010645,-5,296,SJC,BUR\n01010645,5,405,MCI,MDW\n01010645,9,460,TPA,BHM\n01010647,17,293,LBB,DAL\n01010650,20,570,BHM,HOU\n01010650,7,588,BWI,BNA\n01010653,16,590,SLC,LAX\n01010655,-19,1797,LAX,BNA\n01010655,-28,1864,BWI,SLC\n01010700,-10,1481,PDX,MCI\n01010700,-10,361,OAK,ONT\n01010700,-28,1235,LAS,HOU\n01010700,-3,256,LAS,PHX\n01010700,-3,588,SLC,OAK\n01010700,-4,423,OMA,MDW\n01010700,-4,612,TPA,BNA\n01010700,-5,1090,AUS,LAS\n01010700,-5,296,BUR,SJC\n01010700,-5,369,PHX,BUR\n01010700,-5,407,OAK,LAS\n01010700,-6,325,OAK,BUR\n01010700,-7,236,LAS,LAX\n01010700,0,223,BUR,LAS\n01010700,0,303,MSY,HOU\n01010700,1,358,BUR,SMF\n01010700,12,550,MCO,MSY\n01010700,17,284,MDW,CMH\n01010700,4,307,CLE,MDW\n01010704,-2,457,DTW,BNA\n01010705,-1,471,MSY,BNA\n01010705,-10,443,RDU,BNA\n01010705,-15,677,LAX,ABQ\n01010705,-18,1246,HOU,BWI\n01010705,-5,188,SJC,RNO\n01010705,-9,386,SJC,LAS\n01010705,0,588,OAK,SLC\n01010705,13,365,JAX,BHM\n01010705,4,1072,MCO,MCI\n01010705,7,967,MCI,BWI\n01010706,-5,303,HOU,MSY\n01010708,-14,765,ISP,MDW\n01010710,-15,1959,OAK,BNA\n01010710,-26,2277,PVD,PHX\n01010710,-31,1599,SAN,MSY\n01010710,-8,251,STL,MDW\n01010710,0,1506,SDF,PHX\n01010710,2,842,TPA,BWI\n01010715,-12,515,IND,BWI\n01010715,-13,1076,TUL,LAS\n01010715,-2,447,SFO,SAN\n01010715,-25,2106,BWI,LAS\n01010715,-3,405,MCI,MDW\n01010715,-3,546,GEG,SLC\n01010715,-7,386,LAS,SJC\n01010715,24,938,MHT,BNA\n01010720,-13,1489,OAK,MCI\n01010720,-20,632,RDU,MDW\n01010720,-5,446,OAK,SAN\n01010720,-8,762,PDX,LAS\n01010720,13,479,SMF,PDX\n01010725,-12,852,BDL,BNA");

doflights(flights);

//d3.csv("flights-3m.json", 


function doflights(flights) {
console.log("this");

  // Various formatters.
  var formatNumber = d3.format(",d"),
      formatChange = d3.format("+,d"),
      formatDate = d3.time.format("%B %d, %Y"),
      formatTime = d3.time.format("%I:%M %p");

  // A nest operator, for grouping the flight list.
  var nestByDate = d3.nest()
      .key(function(d) { return d3.time.day(d.date); });

  // A little coercion, since the CSV is untyped.
  flights.forEach(function(d, i) {
    d.index = i;
    d.date = parseDate(d.date);
    d.delay = +d.delay;
    d.distance = +d.distance;
  });

  // Create the crossfilter for the relevant dimensions and groups.
  var flight = crossfilter(flights),
      all = flight.groupAll(),
      date = flight.dimension(function(d) { return d3.time.day(d.date); }),
      dates = date.group(),
      hour = flight.dimension(function(d) { return d.date.getHours() + d.date.getMinutes() / 60; }),
      hours = hour.group(Math.floor),
      delay = flight.dimension(function(d) { return Math.max(-60, Math.min(149, d.delay)); }),
      delays = delay.group(function(d) { return Math.floor(d / 10) * 10; }),
      distance = flight.dimension(function(d) { return Math.min(1999, d.distance); }),
      distances = distance.group(function(d) { return Math.floor(d / 50) * 50; });

  var charts = [

    barChart()
        .dimension(hour)
        .group(hours)
      .x(d3.scale.linear()
        .domain([0, 24])
        .rangeRound([0, 10 * 24])),

    barChart()
        .dimension(delay)
        .group(delays)
      .x(d3.scale.linear()
        .domain([-60, 150])
        .rangeRound([0, 10 * 21])),

    barChart()
        .dimension(distance)
        .group(distances)
      .x(d3.scale.linear()
        .domain([0, 2000])
        .rangeRound([0, 10 * 40])),

    barChart()
        .dimension(date)
        .group(dates)
        .round(d3.time.day.round)
      .x(d3.time.scale()
        .domain([new Date(2001, 0, 1), new Date(2001, 3, 1)])
        .rangeRound([0, 10 * 90]))
        .filter([new Date(2001, 1, 1), new Date(2001, 2, 1)])

  ];

  // Given our array of charts, which we assume are in the same order as the
  // .chart elements in the DOM, bind the charts to the DOM and render them.
  // We also listen to the chart's brush events to update the display.
  var chart = d3.selectAll(".chart")
      .data(charts)
      .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });

  // Render the initial lists.
  var list = d3.selectAll(".list")
      .data([flightList]);

  // Render the total.
  d3.selectAll("#total")
      .text(formatNumber(flight.size()));

  renderAll();

  // Renders the specified chart or list.
  function render(method) {
    d3.select(this).call(method);
  }

  // Whenever the brush moves, re-rendering everything.
  function renderAll() {
    chart.each(render);
    list.each(render);
    d3.select("#active").text(formatNumber(all.value()));
  }

  // Like d3.time.format, but faster.
  function parseDate(d) {
    return new Date(2001,
        d.substring(0, 2) - 1,
        d.substring(2, 4),
        d.substring(4, 6),
        d.substring(6, 8));
  }

  window.filter = function(filters) {
    filters.forEach(function(d, i) { charts[i].filter(d); });
    renderAll();
  };

  window.reset = function(i) {
    charts[i].filter(null);
    renderAll();
  };

  function flightList(div) {
    var flightsByDate = nestByDate.entries(date.top(40));

    div.each(function() {
      var date = d3.select(this).selectAll(".date")
          .data(flightsByDate, function(d) { return d.key; });

      date.enter().append("div")
          .attr("class", "date")
        .append("div")
          .attr("class", "day")
          .text(function(d) { return formatDate(d.values[0].date); });

      date.exit().remove();

      var flight = date.order().selectAll(".flight")
          .data(function(d) { return d.values; }, function(d) { return d.index; });

      var flightEnter = flight.enter().append("div")
          .attr("class", "flight");

      flightEnter.append("div")
          .attr("class", "time")
          .text(function(d) { return formatTime(d.date); });

      flightEnter.append("div")
          .attr("class", "origin")
          .text(function(d) { return d.origin; });

      flightEnter.append("div")
          .attr("class", "destination")
          .text(function(d) { return d.destination; });

      flightEnter.append("div")
          .attr("class", "distance")
          .text(function(d) { return formatNumber(d.distance) + " mi."; });

      flightEnter.append("div")
          .attr("class", "delay")
          .classed("early", function(d) { return d.delay < 0; })
          .text(function(d) { return formatChange(d.delay) + " min."; });

      flight.exit().remove();

      flight.order();
    });
  }

  function barChart() {
    if (!barChart.id) barChart.id = 0;

    var margin = {top: 10, right: 10, bottom: 20, left: 10},
        x,
        y = d3.scale.linear().range([100, 0]),
        id = barChart.id++,
        axis = d3.svg.axis().orient("bottom"),
        brush = d3.svg.brush(),
        brushDirty,
        dimension,
        group,
        round;

    function chart(div) {
      var width = x.range()[1],
          height = y.range()[0];

      y.domain([0, group.top(1)[0].value]);

      div.each(function() {
        var div = d3.select(this),
            g = div.select("g");

        // Create the skeletal chart.
        if (g.empty()) {
          div.select(".title").append("a")
              .attr("href", "javascript:reset(" + id + ")")
              .attr("class", "reset")
              .text("reset")
              .style("display", "none");

          g = div.append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          g.append("clipPath")
              .attr("id", "clip-" + id)
            .append("rect")
              .attr("width", width)
              .attr("height", height);

          g.selectAll(".bar")
              .data(["background", "foreground"])
            .enter().append("path")
              .attr("class", function(d) { return d + " bar"; })
              .datum(group.all());

          g.selectAll(".foreground.bar")
              .attr("clip-path", "url(#clip-" + id + ")");

          g.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(0," + height + ")")
              .call(axis);

          // Initialize the brush component with pretty resize handles.
          var gBrush = g.append("g").attr("class", "brush").call(brush);
          gBrush.selectAll("rect").attr("height", height);
          gBrush.selectAll(".resize").append("path").attr("d", resizePath);
        }

        // Only redraw the brush if set externally.
        if (brushDirty) {
          brushDirty = false;
          g.selectAll(".brush").call(brush);
          div.select(".title a").style("display", brush.empty() ? "none" : null);
          if (brush.empty()) {
            g.selectAll("#clip-" + id + " rect")
                .attr("x", 0)
                .attr("width", width);
          } else {
            var extent = brush.extent();
            g.selectAll("#clip-" + id + " rect")
                .attr("x", x(extent[0]))
                .attr("width", x(extent[1]) - x(extent[0]));
          }
        }

        g.selectAll(".bar").attr("d", barPath);
      });

      function barPath(groups) {
        var path = [],
            i = -1,
            n = groups.length,
            d;
        while (++i < n) {
          d = groups[i];
          path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
        }
        return path.join("");
      }

      function resizePath(d) {
        var e = +(d == "e"),
            x = e ? 1 : -1,
            y = height / 3;
        return "M" + (.5 * x) + "," + y
            + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
            + "V" + (2 * y - 6)
            + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
            + "Z"
            + "M" + (2.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8)
            + "M" + (4.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8);
      }
    }

    brush.on("brushstart.chart", function() {
      var div = d3.select(this.parentNode.parentNode.parentNode);
      div.select(".title a").style("display", null);
    });

    brush.on("brush.chart", function() {
      var g = d3.select(this.parentNode),
          extent = brush.extent();
      if (round) g.select(".brush")
          .call(brush.extent(extent = extent.map(round)))
        .selectAll(".resize")
          .style("display", null);
      g.select("#clip-" + id + " rect")
          .attr("x", x(extent[0]))
          .attr("width", x(extent[1]) - x(extent[0]));
      dimension.filterRange(extent);
    });

    brush.on("brushend.chart", function() {
      if (brush.empty()) {
        var div = d3.select(this.parentNode.parentNode.parentNode);
        div.select(".title a").style("display", "none");
        div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
        dimension.filterAll();
      }
    });

    chart.margin = function(_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };

    chart.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      axis.scale(x);
      brush.x(x);
      return chart;
    };

    chart.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return chart;
    };

    chart.dimension = function(_) {
      if (!arguments.length) return dimension;
      dimension = _;
      return chart;
    };

    chart.filter = function(_) {
      if (_) {
        brush.extent(_);
        dimension.filterRange(_);
      } else {
        brush.clear();
        dimension.filterAll();
      }
      brushDirty = true;
      return chart;
    };

    chart.group = function(_) {
      if (!arguments.length) return group;
      group = _;
      return chart;
    };

    chart.round = function(_) {
      if (!arguments.length) return round;
      round = _;
      return chart;
    };

    return d3.rebind(chart, brush, "on");
  }
}
