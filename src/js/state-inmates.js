/* global window: true */

import $ from 'jquery';
import * as d3 from 'd3';


$(() => {
  const windowWidth = $(window).width();
  let fullWidth;
  let fullHeight;

  // responsive
  if (windowWidth >= 650) {
    fullWidth = 600;
    fullHeight = 400;
  } else if (windowWidth <= 350) {
    fullWidth = 290;
    fullHeight = 400;
  } else {
    fullWidth = windowWidth - 50;
    fullHeight = fullWidth - 50;
  }

  const margin = { top: 30, right: 20, bottom: 40, left: 40 };
  const width = fullWidth - margin.left - margin.right;
  const height = fullHeight - margin.top - margin.bottom;

  const x = d3.scaleLinear()
      .range([0, width]);

  const y = d3.scaleLinear()
      .range([height, 0]);

  const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.inmates))
      .curve(d3.curveCardinal);

  const svg = d3.select('#stateInmatesLine')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const parseTime = d3.timeParse('%d-%m-%Y');
  const parseMonth = d3.timeParse('%m');

  // data
  d3.csv('assets/stateInmates.csv', (t) => {
    const d = t;
    d.inmates = +d.inmates;
    d.date = parseTime(`01-${d.month}-${d.year}`);
    return d;
  }, (error, data) => {
    if (error) throw error;

    x.domain([new Date(2011, 0, 1), new Date(2017, 0, 1)]);
    y.domain([3000, 6000]);

    // x and y axes
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x)
          .tickValues([new Date(2011, 0, 1), new Date(2012, 0, 1),
            new Date(2013, 0, 1), new Date(2014, 0, 1), new Date(2015, 0, 1),
            new Date(2016, 0, 1), new Date(2017, 0, 1)])
          .tickFormat(d3.timeFormat('%Y')));

    svg.append('g')
        .attr('class', 'y axis')
        .call(d3.axisLeft(y)
          .tickValues([3000, 4000, 5000, 6000])
          .tickFormat(d3.format(','))
          .tickSizeInner(-width)
          .tickSizeOuter(0))
      .append('text')
        .attr('class', 'axis-title')
        .attr('x', -40)
        .attr('y', -20)
        .attr('dy', '.71em')
        .style('text-anchor', 'start')
        .text('Female Inmates');

    svg.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', line);

    // add hover line and circle
    const focus = svg.append('g')
        .attr('class', 'focus')
        .style('display', 'none');

    focus.append('line')
      .attr('class', 'y')
      .attr('y1', 0)
      .attr('y2', height);

    const circle = svg.append('g')
      .append('circle')
        .attr('r', 4.5)
        .style('display', 'none');

    // tooltip variables
    const tooltipWidth = 120;
    const tooltipHeight = 40;

    const tooltip = focus.append('g')
        .attr('class', 'tooltip')
        .style('display', 'none');

    tooltip.append('rect')
        .attr('width', tooltipWidth)
        .attr('height', tooltipHeight);

    const tooltipText = tooltip.append('text');

    tooltipText.append('tspan')
      .attr('id', 'dateSpan')
      .attr('x', 5)
      .attr('dy', '1.2em');

    tooltipText.append('tspan')
      .attr('id', 'femaleSpan')
      .attr('x', 5)
      .attr('dy', '1.2em');

    // functions for hover later
    const bisectDate = d3.bisector(d => d.date).left;
    const mousemove = () => {
      const mouse = d3.mouse(svg.node());
      const x0 = x.invert(mouse[0]);
      const i = bisectDate(data, x0, 1); // gives index of element which has date higher than x0
      const d0 = data[i - 1];
      const d1 = data[i];
      if (d1) {
        const d = x0 - d0.date > d1.date - x0 ? d1 : d0;

        // draw circle
        circle.attr('transform', `translate(${x(d.date)} , ${y(d.inmates)})`);

        // draw line
        focus.select('line.y')
          .attr('transform', `translate(${x(d.date)} , ${y(y.domain()[1])})`);

        // draw tooltip
        svg.select('#dateSpan').text(`${d3.timeFormat('%b')(parseMonth(d.month))} ${d.year}`);
        svg.select('#femaleSpan').text(`Female Inmates: ${d3.format(',')(d.inmates)}`);

        const xPosition = (mouse[0] + tooltipWidth > width) ?
          mouse[0] - tooltipWidth - 10 : mouse[0] + 20;
        const yPosition = (mouse[1] + tooltipHeight > height) ?
          mouse[1] - tooltipHeight - 10 : mouse[1] + 10;

        focus.select('g.tooltip')
          .style('display', null)
          .attr('transform', `translate (${xPosition} , ${yPosition})`);
      }
    };

    // holding cell for the mouseover line
    svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .on('mouseover', () => { focus.style('display', null); circle.style('display', null); })
      .on('mouseout', () => { focus.style('display', 'none'); circle.style('display', 'none'); })
      .on('mousemove', mousemove);
  });

  d3.selection.prototype.moveToFront = () =>
    this.each(() => {
      this.parentNode.appendChild(this);
    });
});
