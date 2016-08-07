const counts = [1, 1, 2, 5, 12, 35]

const canvasLength = 960
const ringSpacing = 75
const blockSize = 8

const svg = d3.select('body').append('svg')
  .attr('width', canvasLength)
  .attr('height', canvasLength)

// Draw the minos for each generation
function drawPolyominoes(element, polyominoes) {
  const diagram = element.append('g').classed('diagram', true)
    .attr('transform', `translate(${canvasLength/2} ${canvasLength/2}) rotate(-90)`)

  // Draw the concentric orbital rings
  diagram.selectAll('circle.orbital')
    .data(d3.range(polyominoes.length))
    .enter().append('circle').classed('ring', true)
    .attr('r', d => d * ringSpacing)
    .attr('stroke', 'black')
    .attr('fill', 'none')
    .attr('data-generation', d => d + 1)

  // Draw groups for each generation
  const generations = diagram.selectAll('.generation')
    .data(polyominoes)
    .enter().append('g')
    .classed('generation', true)
    .attr('data-generation', (d, i) => i + 1)

  function transform(mino, i) {
    genIndex = mino.length -1
    // TODO it feels dirty referencing the parent element like this
    numMinosInGen = polyominoes[genIndex].length
    radius = genIndex * ringSpacing
    x = radius * Math.cos(i/numMinosInGen * 2 * Math.PI)
    y = radius * Math.sin(i/numMinosInGen * 2 * Math.PI)
    return `translate(${x} ${y})`
  }

  const minos = generations.selectAll('.mino')
    .data(generation => generation)
    .enter().append('g')
    .classed('mino', true)
    .attr('transform', transform)

  minos.selectAll('rect.block')
    .data(mino => mino)
    .enter().append('rect').classed('block', true)
    .attr('width', blockSize)
    .attr('height', blockSize)
    .attr('x', d => d[0] * blockSize)
    .attr('y', d => d[1] * blockSize)
}

d3.json('data/minos.json', (data) => {
  const {nodes, graph} = data
  drawPolyominoes(svg, nodes)
})
