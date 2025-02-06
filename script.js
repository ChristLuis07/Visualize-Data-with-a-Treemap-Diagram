document.addEventListener("DOMContentLoaded", function () {
    let request = new XMLHttpRequest();
    request.open(
        "GET",
        "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json",
        true
    )
    request.send();

    request.onload = function () {
        const dataset = JSON.parse(request.responseText);

        const w = 1000;
        const h = 600;
        const paddingTop = 160;
        const paddingLeft = 0;
        const paddingRight = 0;
        const paddingBottom = 0;

        const labelPadding = 5;

        const toolTipSpacingY = -30;
        const toolTipSpacingX = 20;

        const legendSpacing = 20;
        const legendRectW = (w - paddingLeft - paddingRight - (dataset.children.length - 1) * legendSpacing) / dataset.children.length;
        const legendRectH = 20;

        const tileStroke = "white";
        const colors = {};

        const colorBuilder = function () {
            let numberOfColors = dataset.children.length;
            let hueStep = 359 / numberOfColors;
            for (i in dataset.children) {
                colors[dataset.children[i].name] = "hsl(" + Math.round(i * hueStep + hueStep / 2) + ", 75%, 85%)"
            }
        };
        colorBuilder();

        const svg = d3.select("#container")
            .append("svg")
            .attr("id", "chart")
            .attr("width", w)
            .attr("height", h);

        svg
            .append("text")
            .attr("id", "title")
            .text("Movie Sales")
            .attr("x", w / 2)
            .attr("y", 2 / 5 * paddingTop)
            .attr("text-anchor", "middle");

        svg
            .append("text")
            .attr("id", "description")
            .text("Top 100 highest grossing movies by genre")
            .attr("x", w / 2)
            .attr("y", 2 / 5 * paddingTop)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "hanging");

        const legend = svg
            .append("g")
            .attr("id", "legend")
            .attr("transform", "translate(" + (paddingLeft) + ", " + (2 / 3 * paddingTop) + ")")
            .selectAll("g")
            .data(dataset.children)
            .enter()
            .append("g");

        legend
            .append("rect")
            .attr("class", "legend-item")
            .attr("width", legendRectW)
            .attr("height", legendRectH)
            .attr("x", (d, i) => i * (legendRectW + legendSpacing))
            .attr("fill", (d) => colors[d.name]);

        legend
            .append("text")
            .attr("class", "legend-label")
            .attr("x", (d, i) => legendRectW / 2 + i * (legendRectW + legendSpacing))
            .attr("y", legendRectH / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .text((d) => d.name);

        const toolTipBox = d3.select("#container")
            .append("div")
            .attr("id", "tooltip");

        const toolTipContent = function (d) {
            let tempValue = parseInt(d.data.value);
            let localeValue = tempValue.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
            return "<span id='tooltip-name'>" + d.data.name + "</span><br/><span id='tooltip-category'>(" + d.data.category + ")</span><br/><span id='tooltip-value'>" + localeValue + "</span>";
        };

        const root = d3.hierarchy(dataset);
        const treemapLayout = d3.treemap()
            .size([w - paddingLeft - paddingRight, h - paddingTop - paddingBottom])
            .paddingInner(0);

        root.sum((d) => d.value);
        treemapLayout(root);

        const tiles = svg
            .append("g")
            .attr("id", "treemap")
            .attr("transform", "translate(" + paddingLeft + ", " + paddingTop + ")")
            .selectAll("g")
            .data(root.leaves())
            .enter()
            .append("g")
            .attr("transform", (d) => "translate(" + d.x0 + ", " + d.y0 + ")");

        tiles
            .append("rect")
            .attr("class", "tile")
            .attr("data-name", (d) => d.data.name)
            .attr("data-category", (d) => d.data.category)
            .attr("data-value", (d) => d.data.value)
            .attr("width", (d) => d.x1 - d.x0)
            .attr("height", (d) => d.y1 - d.y0)
            .attr("stroke", tileStroke)
            .attr("fill", (d) => colors[d.data.category])
            .on("mousemove", (d, i) => {
                toolTipBox
                    .html(toolTipContent(d))
                    .attr("data-value", d.data.value)
                    .style("top", d3.event.pageY + toolTipSpacingY + "px")
                    .style("left", d3.event.pageX + toolTipSpacingX + "px")
                    .style("background", colors[d.data.category])
                    .style("opacity", 0.95)
                    .style("visibility", "visible");
            })
            .on("mouseout", (d, i) => {
                toolTipBox
                    .style("opacity", 0)
                    .style("visibility", "hidden");
            });

        tiles
            .append("foreignObject")
            .attr("width", (d) => d.x1 - d.x0)
            .attr("height", 0.01)
            .append("xhtml:div")
            .attr("class", "tile-label")
            .html((d) => d.data.name);
    };
});
