const counts = [1, 1, 2, 5, 12, 35]

const canvasLength = 960
const ringSpacing = 50

const topAngle = -Math.PI/2;

const svg = d3.select('body').append('svg')
  .attr('width', canvasLength)
  .attr('height', canvasLength)

svg.selectAll('circle.ring')
  .data(d3.range(counts.length))
  .enter()
  .append('circle')
  .classed('ring', true)
  .attr('cx', canvasLength/2)
  .attr('cy', canvasLength/2)
  .attr('r', d => d * ringSpacing)
  .attr('stroke', 'black')
  .attr('fill', 'none')

// Draw the minos for each generation
d3.select('svg').selectAll('.generation')
  .data(counts)
  .enter().append('g')
  .classed('generation', true)
  .selectAll('circle.mino')
  .data((numMinos, i) => d3.range(1, numMinos + 1).map(minoIndex =>
        [(minoIndex / numMinos), i])) // TODO how do we use parent indices?
  .enter()
  .append('circle')
  .classed('mino', true)
  .attr('r', 5)
  .attr('cx', (d, i) => canvasLength/2 + d[1] * ringSpacing * Math.cos(d[0] * 2 * Math.PI + topAngle))
  .attr('cy', (d, i) => canvasLength/2 + d[1] * ringSpacing * Math.sin(d[0] * 2 * Math.PI + topAngle))
